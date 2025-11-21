<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmKiosk;
use App\Models\CrmWaterTruck;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KioskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $query = CrmKiosk::query()
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc');

        $kiosks = $query->paginate($perPage);

        // Add summary statistics
        $allKiosks = CrmKiosk::all();
        $summary = [
            'total_kiosks' => $allKiosks->count(),
            'active_kiosks' => $allKiosks->where('status', 'active')->count(),
            'today_total_sales' => $allKiosks->sum('today_sales'),
            'total_balance' => $allKiosks->sum('balance'),
        ];

        return response()->json([
            ...$kiosks->toArray(),
            'summary' => $summary,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kiosk_code' => 'required|string|max:50|unique:crm_kiosks,kiosk_code',
            'vendor_name' => 'required|string|max:255',
            'vendor_phone' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'coordinates' => 'required|array',
            'coordinates.lat' => 'required|numeric',
            'coordinates.lng' => 'required|numeric',
            'daily_target' => 'required|numeric|min:0',
        ]);

        $kiosk = CrmKiosk::create([
            ...$validated,
            'tenant_id' => auth()->user()->currentTenantId(),
        ]);

        return response()->json($kiosk, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $kiosk = CrmKiosk::findOrFail($id);

        $validated = $request->validate([
            'kiosk_code' => 'sometimes|string|max:50|unique:crm_kiosks,kiosk_code,' . $id,
            'vendor_name' => 'sometimes|string|max:255',
            'vendor_phone' => 'sometimes|string|max:20',
            'location' => 'sometimes|string|max:255',
            'coordinates' => 'sometimes|array',
            'daily_target' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:active,suspended,inactive',
        ]);

        $kiosk->update($validated);

        return response()->json($kiosk);
    }

    public function destroy(int $id): JsonResponse
    {
        $kiosk = CrmKiosk::findOrFail($id);
        $kiosk->delete();

        return response()->json(['message' => 'Kiosk deleted successfully']);
    }

    public function sales(int $id, Request $request): JsonResponse
    {
        $kiosk = CrmKiosk::findOrFail($id);
        
        // Generate 7-day sales data (TODO: Replace with actual sales transactions)
        $sales = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $amount = $i === 0 ? $kiosk->today_sales : rand(30000, 60000);
            
            $sales->push([
                'date' => $date->format('Y-m-d'),
                'volume' => round($amount / 1000, 2),
                'amount' => $amount,
                'transactions' => rand(80, 120),
            ]);
        }

        return response()->json([
            'kiosk_id' => $id,
            'sales' => $sales,
            'total_volume' => $sales->sum('volume'),
            'total_amount' => $sales->sum('amount'),
            'total_transactions' => $sales->sum('transactions'),
            'average_daily' => round($sales->avg('amount'), 2),
        ]);
    }

    public function trucks(Request $request): JsonResponse
    {
        $trucks = CrmWaterTruck::all();

        return response()->json([
            'data' => $trucks,
            'total' => $trucks->count(),
            'summary' => [
                'total_trips' => $trucks->sum('trips_today'),
                'total_revenue' => $trucks->sum('revenue_today'),
                'active_trucks' => $trucks->whereIn('status', ['in_transit', 'available'])->count(),
            ],
        ]);
    }
}
