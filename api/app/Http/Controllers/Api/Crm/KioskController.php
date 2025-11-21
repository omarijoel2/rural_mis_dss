<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KioskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        // Mock kiosk data (replace with actual kiosks table)
        $kiosks = collect([
            [
                'id' => 1,
                'kiosk_code' => 'KSK-001',
                'vendor_name' => 'Mama Watamu Kiosk',
                'vendor_phone' => '+254712345678',
                'location' => 'Kawangware, Zone A',
                'coordinates' => ['lat' => -1.289505, 'lng' => 36.750326],
                'status' => 'active',
                'daily_target' => 50000,
                'today_sales' => 42500,
                'balance' => 125000,
                'last_sale_date' => now()->subHours(2)->format('Y-m-d H:i:s'),
                'created_at' => now()->subMonths(8)->format('Y-m-d'),
            ],
            [
                'id' => 2,
                'kiosk_code' => 'KSK-002',
                'vendor_name' => 'Baba Njeri Water Point',
                'vendor_phone' => '+254723456789',
                'location' => 'Kibera, Olympic',
                'coordinates' => ['lat' => -1.313321, 'lng' => 36.787598],
                'status' => 'active',
                'daily_target' => 35000,
                'today_sales' => 38200,
                'balance' => 89000,
                'last_sale_date' => now()->subHours(1)->format('Y-m-d H:i:s'),
                'created_at' => now()->subMonths(6)->format('Y-m-d'),
            ],
            [
                'id' => 3,
                'kiosk_code' => 'KSK-003',
                'vendor_name' => 'Grace Water Station',
                'vendor_phone' => '+254734567890',
                'location' => 'Mathare, 4A',
                'coordinates' => ['lat' => -1.258715, 'lng' => 36.859430],
                'status' => 'suspended',
                'daily_target' => 40000,
                'today_sales' => 0,
                'balance' => -15000,
                'last_sale_date' => now()->subDays(5)->format('Y-m-d H:i:s'),
                'created_at' => now()->subMonths(12)->format('Y-m-d'),
            ],
        ]);

        if ($request->has('status')) {
            $kiosks = $kiosks->where('status', $request->input('status'));
        }

        return response()->json([
            'data' => $kiosks->values(),
            'total' => $kiosks->count(),
            'per_page' => $perPage,
            'current_page' => 1,
            'summary' => [
                'total_kiosks' => $kiosks->count(),
                'active_kiosks' => $kiosks->where('status', 'active')->count(),
                'today_total_sales' => $kiosks->sum('today_sales'),
                'total_balance' => $kiosks->sum('balance'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kiosk_code' => 'required|string|max:50|unique:kiosks,kiosk_code',
            'vendor_name' => 'required|string|max:255',
            'vendor_phone' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'coordinates' => 'required|array',
            'coordinates.lat' => 'required|numeric',
            'coordinates.lng' => 'required|numeric',
            'daily_target' => 'required|numeric|min:0',
        ]);

        $kiosk = [
            'id' => rand(100, 999),
            ...$validated,
            'status' => 'active',
            'today_sales' => 0,
            'balance' => 0,
            'last_sale_date' => null,
            'created_at' => now()->format('Y-m-d'),
        ];

        return response()->json($kiosk, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'vendor_name' => 'sometimes|string|max:255',
            'vendor_phone' => 'sometimes|string|max:20',
            'location' => 'sometimes|string|max:255',
            'daily_target' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:active,suspended,inactive',
        ]);

        return response()->json([
            'id' => $id,
            'message' => 'Kiosk updated successfully',
            ...$validated,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        return response()->json(['message' => 'Kiosk deleted successfully']);
    }

    public function sales(int $id, Request $request): JsonResponse
    {
        // Mock sales transactions
        $sales = collect([
            ['date' => now()->subDays(6)->format('Y-m-d'), 'volume' => 45.5, 'amount' => 45500, 'transactions' => 89],
            ['date' => now()->subDays(5)->format('Y-m-d'), 'volume' => 52.3, 'amount' => 52300, 'transactions' => 102],
            ['date' => now()->subDays(4)->format('Y-m-d'), 'volume' => 48.7, 'amount' => 48700, 'transactions' => 95],
            ['date' => now()->subDays(3)->format('Y-m-d'), 'volume' => 51.2, 'amount' => 51200, 'transactions' => 99],
            ['date' => now()->subDays(2)->format('Y-m-d'), 'volume' => 49.8, 'amount' => 49800, 'transactions' => 97],
            ['date' => now()->subDays(1)->format('Y-m-d'), 'volume' => 46.3, 'amount' => 46300, 'transactions' => 91],
            ['date' => now()->format('Y-m-d'), 'volume' => 42.5, 'amount' => 42500, 'transactions' => 83],
        ]);

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
        // Mock water truck data
        $trucks = collect([
            [
                'id' => 1,
                'truck_no' => 'TRK-001',
                'driver_name' => 'James Omondi',
                'phone' => '+254745678901',
                'capacity' => 10000,
                'status' => 'in_transit',
                'current_load' => 10000,
                'trips_today' => 2,
                'revenue_today' => 50000,
                'last_location' => ['lat' => -1.292066, 'lng' => 36.821945],
            ],
            [
                'id' => 2,
                'truck_no' => 'TRK-002',
                'driver_name' => 'Peter Kimani',
                'phone' => '+254756789012',
                'capacity' => 8000,
                'status' => 'loading',
                'current_load' => 6500,
                'trips_today' => 3,
                'revenue_today' => 72000,
                'last_location' => ['lat' => -1.286389, 'lng' => 36.817223],
            ],
        ]);

        return response()->json([
            'data' => $trucks,
            'total' => $trucks->count(),
            'summary' => [
                'total_trips' => $trucks->sum('trips_today'),
                'total_revenue' => $trucks->sum('revenue_today'),
                'active_trucks' => $trucks->where('status', '!=', 'idle')->count(),
            ],
        ]);
    }
}
