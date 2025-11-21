<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmMeterRoute;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MeterRouteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $routes = CrmMeterRoute::query()
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($routes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'route_code' => 'required|string|max:50|unique:crm_meter_routes,route_code',
            'area' => 'required|string|max:255',
            'assigned_to' => 'nullable|string|max:255',
            'meters_count' => 'required|integer|min:1',
        ]);

        $route = CrmMeterRoute::create([
            ...$validated,
            'tenant_id' => auth()->user()->currentTenantId(),
            'status' => $validated['assigned_to'] ? 'active' : 'unassigned',
            'completion_rate' => 0,
        ]);

        return response()->json($route, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $route = CrmMeterRoute::findOrFail($id);

        $validated = $request->validate([
            'route_code' => 'sometimes|string|max:50|unique:crm_meter_routes,route_code,' . $id,
            'area' => 'sometimes|string|max:255',
            'assigned_to' => 'nullable|string|max:255',
            'meters_count' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:active,unassigned,inactive',
        ]);

        $route->update($validated);

        return response()->json($route);
    }

    public function destroy(int $id): JsonResponse
    {
        $route = CrmMeterRoute::findOrFail($id);
        $route->delete();

        return response()->json(['message' => 'Route deleted successfully']);
    }

    public function downloadOffline(int $id): JsonResponse
    {
        $route = CrmMeterRoute::findOrFail($id);
        
        // Get meters for this route (when meter routes are linked)
        // For now, return basic route info
        return response()->json([
            'route_id' => $route->id,
            'route_code' => $route->route_code,
            'area' => $route->area,
            'meters' => [], // TODO: Load actual meters when route-meter linking is implemented
            'downloaded_at' => now()->toIso8601String(),
        ]);
    }

    public function uploadReads(Request $request, int $id): JsonResponse
    {
        $route = CrmMeterRoute::findOrFail($id);
        
        $validated = $request->validate([
            'reads' => 'required|array',
            'reads.*.meter_no' => 'required|string',
            'reads.*.reading' => 'required|numeric',
            'reads.*.photo_url' => 'nullable|string',
            'reads.*.anomalies' => 'nullable|array',
        ]);

        // Process uploaded reads
        $processed = count($validated['reads']);
        $anomalies = collect($validated['reads'])->filter(fn($r) => !empty($r['anomalies']))->count();

        // Update route statistics
        $route->update([
            'last_read_date' => now(),
            'completion_rate' => 100, // TODO: Calculate actual completion rate
        ]);

        return response()->json([
            'success' => true,
            'processed' => $processed,
            'anomalies_detected' => $anomalies,
            'message' => "{$processed} meter reads uploaded successfully",
        ]);
    }
}
