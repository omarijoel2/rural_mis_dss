<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\MeterRoute;
use App\Models\MeterReadingCycle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MeterRouteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MeterRoute::with(['scheme', 'assignedTo']);

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $routes = $query->orderBy('name')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $routes->items(),
            'meta' => [
                'current_page' => $routes->currentPage(),
                'last_page' => $routes->lastPage(),
                'per_page' => $routes->perPage(),
                'total' => $routes->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'route_code' => 'required|string|unique:meter_routes,route_code',
            'name' => 'required|string|max:255',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            'read_day' => 'nullable|integer|min:1|max:31',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;
        $validated['status'] = 'active';

        $route = MeterRoute::create($validated);

        return response()->json(['data' => $route], 201);
    }

    public function show(MeterRoute $route): JsonResponse
    {
        $route->load(['scheme', 'assignedTo', 'cycles']);
        return response()->json(['data' => $route]);
    }

    public function update(Request $request, MeterRoute $route): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            'status' => 'nullable|in:active,inactive',
            'read_day' => 'nullable|integer|min:1|max:31',
        ]);

        $route->update($validated);

        return response()->json(['data' => $route]);
    }

    public function destroy(MeterRoute $route): JsonResponse
    {
        $route->delete();
        return response()->json(null, 204);
    }

    public function cycles(Request $request): JsonResponse
    {
        $query = MeterReadingCycle::with(['route']);

        if ($request->has('route_id')) {
            $query->where('route_id', $request->route_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $cycles = $query->orderBy('period_start', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $cycles->items(),
            'meta' => [
                'current_page' => $cycles->currentPage(),
                'last_page' => $cycles->lastPage(),
                'per_page' => $cycles->perPage(),
                'total' => $cycles->total(),
            ]
        ]);
    }
}
