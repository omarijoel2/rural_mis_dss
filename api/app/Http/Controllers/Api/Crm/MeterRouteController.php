<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MeterRouteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        // Mock route data (replace with actual table when created)
        $routes = collect([
            [
                'id' => 1,
                'route_code' => 'RT-001',
                'area' => 'Central Zone A',
                'assigned_to' => 'John Mwangi',
                'meters_count' => 245,
                'status' => 'active',
                'last_read_date' => now()->subDays(5)->format('Y-m-d'),
                'completion_rate' => 98.4,
                'created_at' => now()->subMonths(6)->format('Y-m-d H:i:s'),
            ],
            [
                'id' => 2,
                'route_code' => 'RT-002',
                'area' => 'Eastern Zone B',
                'assigned_to' => 'Mary Wanjiru',
                'meters_count' => 189,
                'status' => 'active',
                'last_read_date' => now()->subDays(3)->format('Y-m-d'),
                'completion_rate' => 100.0,
                'created_at' => now()->subMonths(5)->format('Y-m-d H:i:s'),
            ],
            [
                'id' => 3,
                'route_code' => 'RT-003',
                'area' => 'Western Zone C',
                'assigned_to' => 'Peter Kamau',
                'meters_count' => 312,
                'status' => 'active',
                'last_read_date' => now()->subDays(7)->format('Y-m-d'),
                'completion_rate' => 95.2,
                'created_at' => now()->subMonths(4)->format('Y-m-d H:i:s'),
            ],
            [
                'id' => 4,
                'route_code' => 'RT-004',
                'area' => 'Northern Zone D',
                'assigned_to' => null,
                'meters_count' => 156,
                'status' => 'unassigned',
                'last_read_date' => null,
                'completion_rate' => 0,
                'created_at' => now()->subDays(2)->format('Y-m-d H:i:s'),
            ],
        ]);

        return response()->json([
            'data' => $routes->values(),
            'total' => $routes->count(),
            'per_page' => $perPage,
            'current_page' => 1,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'route_code' => 'required|string|max:50',
            'area' => 'required|string|max:255',
            'assigned_to' => 'nullable|string|max:255',
            'meters_count' => 'required|integer|min:1',
        ]);

        // Mock creation (replace with actual DB insert)
        $route = array_merge($validated, [
            'id' => rand(5, 100),
            'status' => $validated['assigned_to'] ? 'active' : 'unassigned',
            'last_read_date' => null,
            'completion_rate' => 0,
            'created_at' => now()->format('Y-m-d H:i:s'),
        ]);

        return response()->json($route, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'route_code' => 'sometimes|string|max:50',
            'area' => 'sometimes|string|max:255',
            'assigned_to' => 'nullable|string|max:255',
            'meters_count' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:active,unassigned,inactive',
        ]);

        return response()->json([
            'id' => $id,
            'message' => 'Route updated successfully',
            ...$validated
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        return response()->json(['message' => 'Route deleted successfully']);
    }

    public function downloadOffline(int $id): JsonResponse
    {
        // Generate offline package with meter details
        return response()->json([
            'route_id' => $id,
            'meters' => [
                ['meter_no' => 'M-001', 'account_no' => 'ACC-12345', 'last_read' => 1234.5, 'location' => ['lat' => -1.286389, 'lng' => 36.817223]],
                ['meter_no' => 'M-002', 'account_no' => 'ACC-12346', 'last_read' => 2456.8, 'location' => ['lat' => -1.286500, 'lng' => 36.817300]],
            ],
            'downloaded_at' => now()->toIso8601String(),
        ]);
    }

    public function uploadReads(Request $request, int $id): JsonResponse
    {
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

        return response()->json([
            'success' => true,
            'processed' => $processed,
            'anomalies_detected' => $anomalies,
            'message' => "{$processed} meter reads uploaded successfully",
        ]);
    }
}
