<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmWaterTruck;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WaterTruckController extends Controller
{
    protected function getTenantId(): string
    {
        $user = auth()->user();
        return $user->current_tenant_id ?? '';
    }

    protected function getOrganizationId(): string
    {
        $tenantId = $this->getTenantId();
        if (empty($tenantId)) {
            return '';
        }
        
        $org = DB::table('organizations')
            ->where('tenant_id', $tenantId)
            ->first();
        
        return $org?->id ?? '';
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $orgId = $this->getOrganizationId();
        
        $paginator = CrmWaterTruck::query()
            ->where('tenant_id', $orgId)
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $summary = [
            'total_trucks' => CrmWaterTruck::where('tenant_id', $orgId)->count(),
            'available_trucks' => CrmWaterTruck::where('tenant_id', $orgId)->where('status', 'available')->count(),
            'in_transit_trucks' => CrmWaterTruck::where('tenant_id', $orgId)->where('status', 'in_transit')->count(),
            'maintenance_trucks' => CrmWaterTruck::where('tenant_id', $orgId)->where('status', 'maintenance')->count(),
            'total_trips_today' => CrmWaterTruck::where('tenant_id', $orgId)->sum('trips_today') ?? 0,
            'total_revenue_today' => CrmWaterTruck::where('tenant_id', $orgId)->sum('revenue_today') ?? 0,
            'total_capacity' => CrmWaterTruck::where('tenant_id', $orgId)->sum('capacity') ?? 0,
        ];

        return response()->json([
            'data' => $paginator->items(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'summary' => $summary,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $this->getOrganizationId();

        $validated = $request->validate([
            'truck_no' => [
                'required',
                'string',
                'max:20',
                function ($attribute, $value, $fail) use ($orgId) {
                    $exists = CrmWaterTruck::where('tenant_id', $orgId)
                        ->where('truck_no', $value)
                        ->exists();
                    if ($exists) {
                        $fail('The truck number already exists for this tenant.');
                    }
                },
            ],
            'driver_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'capacity' => 'required|integer|min:1000',
        ]);

        $truck = CrmWaterTruck::create([
            ...$validated,
            'tenant_id' => $orgId,
            'status' => 'available',
            'trips_today' => 0,
            'revenue_today' => 0,
        ]);

        return response()->json($truck, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $this->getOrganizationId();
        $truck = CrmWaterTruck::where('tenant_id', $orgId)->findOrFail($id);

        $validated = $request->validate([
            'truck_no' => [
                'sometimes',
                'string',
                'max:20',
                function ($attribute, $value, $fail) use ($orgId, $id) {
                    $exists = CrmWaterTruck::where('tenant_id', $orgId)
                        ->where('truck_no', $value)
                        ->where('id', '!=', $id)
                        ->exists();
                    if ($exists) {
                        $fail('The truck number already exists for this tenant.');
                    }
                },
            ],
            'driver_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'capacity' => 'sometimes|integer|min:1000',
            'status' => 'sometimes|in:available,in_transit,maintenance',
        ]);

        $truck->update($validated);

        return response()->json($truck);
    }

    public function destroy(int $id): JsonResponse
    {
        $orgId = $this->getOrganizationId();
        $truck = CrmWaterTruck::where('tenant_id', $orgId)->findOrFail($id);
        $truck->delete();

        return response()->json(['message' => 'Water truck deleted successfully']);
    }

    public function trips(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $tenantId = $this->getTenantId();
        
        $query = DB::table('truck_trips')
            ->where('tenant_id', $tenantId)
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->input('status'));
            })
            ->when($request->filled('truck_registration'), function ($q) use ($request) {
                $q->where('truck_registration', $request->input('truck_registration'));
            })
            ->orderBy('departure_time', 'desc');

        $total = $query->count();
        $trips = $query->skip(($request->input('page', 1) - 1) * $perPage)
            ->take($perPage)
            ->get();

        $summary = DB::table('truck_trips')
            ->where('tenant_id', $tenantId)
            ->selectRaw('COUNT(*) as total_trips')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_revenue')
            ->selectRaw('COALESCE(SUM(volume_m3), 0) as total_volume')
            ->selectRaw("COUNT(CASE WHEN status = 'delivered' OR status = 'verified' THEN 1 END) as completed_trips")
            ->selectRaw("COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as active_trips")
            ->selectRaw("COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_trips")
            ->first();

        return response()->json([
            'data' => $trips,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => (int) $request->input('page', 1),
            'summary' => $summary,
        ]);
    }

    public function storeTrip(Request $request): JsonResponse
    {
        $tenantId = $this->getTenantId();

        $validated = $request->validate([
            'truck_registration' => 'required|string|max:20',
            'driver_name' => 'required|string|max:255',
            'driver_phone' => 'nullable|string|max:20',
            'volume_m3' => 'required|numeric|min:0.1',
            'price_per_m3' => 'required|numeric|min:0',
            'source_location' => 'required|string|max:255',
            'delivery_location' => 'required|string|max:255',
            'departure_time' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $tenantTripCount = DB::table('truck_trips')
            ->where('tenant_id', $tenantId)
            ->count();

        $tripCode = 'TRP-' . date('Y') . '-' . str_pad(
            $tenantTripCount + 1,
            4,
            '0',
            STR_PAD_LEFT
        );

        $tripId = Str::uuid()->toString();

        DB::table('truck_trips')->insert([
            'id' => $tripId,
            'tenant_id' => $tenantId,
            'trip_code' => $tripCode,
            'truck_registration' => $validated['truck_registration'],
            'driver_name' => $validated['driver_name'],
            'driver_phone' => $validated['driver_phone'] ?? null,
            'volume_m3' => $validated['volume_m3'],
            'price_per_m3' => $validated['price_per_m3'],
            'total_amount' => $validated['volume_m3'] * $validated['price_per_m3'],
            'source_location' => $validated['source_location'],
            'delivery_location' => $validated['delivery_location'],
            'departure_time' => $validated['departure_time'],
            'status' => 'scheduled',
            'notes' => $validated['notes'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $tripId, 'trip_code' => $tripCode], 201);
    }

    public function updateTripStatus(Request $request, string $tripId): JsonResponse
    {
        $tenantId = $this->getTenantId();

        $validated = $request->validate([
            'status' => 'required|in:scheduled,in_transit,delivered,verified',
            'arrival_time' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $updated = DB::table('truck_trips')
            ->where('id', $tripId)
            ->where('tenant_id', $tenantId)
            ->update([
                'status' => $validated['status'],
                'arrival_time' => $validated['arrival_time'] ?? null,
                'notes' => $validated['notes'] ?? DB::raw('notes'),
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return response()->json(['error' => 'Trip not found'], 404);
        }

        return response()->json(['message' => 'Trip status updated successfully']);
    }
}
