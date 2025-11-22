<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZoneRequest;
use App\Http\Requests\UpdateZoneRequest;
use App\Models\Zone;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        $query = Zone::with(['scheme', 'tenant']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        $zones = $query->paginate($request->get('per_page', 15));

        return response()->json($zones);
    }

    public function store(StoreZoneRequest $request)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        $zone = Zone::create($data);
        $zone->load(['scheme', 'tenant']);

        return response()->json($zone, 201);
    }

    public function show(Zone $zone)
    {
        $zone->load(['scheme', 'tenant']);
        return response()->json($zone);
    }

    public function update(UpdateZoneRequest $request, Zone $zone)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        $zone->update($data);
        $zone->load(['scheme', 'tenant']);

        return response()->json($zone);
    }

    public function destroy(Zone $zone)
    {
        $zone->delete();
        return response()->json(['message' => 'Zone deleted successfully'], 204);
    }

    public function geojson(Request $request)
    {
        $query = Zone::query();
        
        if (auth()->check()) {
            $query->whereHas('scheme', function ($q) {
                $q->where('tenant_id', auth()->user()->tenant_id);
            });
        } else {
            // Default to first tenant for public access
            $defaultTenant = \App\Models\Tenant::first();
            if (!$defaultTenant) {
                return response()->json(['error' => 'No tenant found'], 404);
            }
            $query->whereHas('scheme', function ($q) use ($defaultTenant) {
                $q->where('tenant_id', $defaultTenant->id);
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $zones = $query->limit($request->get('limit', 1000))->get();

        return response()->json(\App\Services\SpatialQueryService::buildMapLayers('zone', $zones));
    }
}
