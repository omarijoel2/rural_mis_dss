<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WqSamplingPoint;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;

class WqSamplingPointController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view water quality sampling points');

        $query = WqSamplingPoint::where('tenant_id', $request->user()->currentTenantId())
            ->with(['facility', 'scheme', 'dma']);

        if ($request->has('kind')) {
            $query->where('kind', $request->kind);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        $points = $query->paginate($request->get('per_page', 15));

        return response()->json($points);
    }

    public function store(Request $request)
    {
        $this->authorize('create water quality sampling points');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100',
            'kind' => 'required|in:source,treatment,reservoir,distribution,kiosk,household',
            'facility_id' => 'nullable|uuid|exists:facilities,id',
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'location' => 'required|array',
            'location.lat' => 'required|numeric|min:-90|max:90',
            'location.lng' => 'required|numeric|min:-180|max:180',
            'elevation_m' => 'nullable|numeric',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['tenant_id'] = $request->user()->currentTenantId();
        $validated['location'] = new Point($validated['location']['lat'], $validated['location']['lng']);

        $point = WqSamplingPoint::create($validated);
        $point->load(['facility', 'scheme', 'dma']);

        return response()->json($point, 201);
    }

    public function show(int $pointId, Request $request)
    {
        $this->authorize('view water quality sampling points');

        $point = WqSamplingPoint::where('tenant_id', $request->user()->currentTenantId())
            ->with(['facility', 'scheme', 'dma'])
            ->findOrFail($pointId);

        return response()->json($point);
    }

    public function update(int $pointId, Request $request)
    {
        $this->authorize('edit water quality sampling points');

        $point = WqSamplingPoint::where('tenant_id', $request->user()->currentTenantId())
            ->findOrFail($pointId);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:100',
            'kind' => 'sometimes|in:source,treatment,reservoir,distribution,kiosk,household',
            'location' => 'sometimes|array',
            'location.lat' => 'required_with:location|numeric|min:-90|max:90',
            'location.lng' => 'required_with:location|numeric|min:-180|max:180',
            'elevation_m' => 'nullable|numeric',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['location'])) {
            $validated['location'] = new Point($validated['location']['lat'], $validated['location']['lng']);
        }

        $point->update($validated);
        $point->load(['facility', 'scheme', 'dma']);

        return response()->json($point);
    }

    public function destroy(int $pointId, Request $request)
    {
        $this->authorize('delete water quality sampling points');

        $point = WqSamplingPoint::where('tenant_id', $request->user()->currentTenantId())
            ->findOrFail($pointId);

        $point->delete();

        return response()->json(['message' => 'Sampling point deleted successfully'], 204);
    }
}
