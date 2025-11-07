<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFacilityRequest;
use App\Http\Requests\UpdateFacilityRequest;
use App\Models\Facility;
use App\Services\SpatialQueryService;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;

class FacilityController extends Controller
{
    public function index(Request $request)
    {
        $query = Facility::where('tenant_id', auth()->user()->tenant_id)
            ->with(['scheme', 'tenant']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'location');
        }

        if ($request->has('near')) {
            [$lat, $lng, $radius] = explode(',', $request->near);
            $query = SpatialQueryService::applyNearFilter($query, (float)$lat, (float)$lng, (float)$radius, 'location');
        }

        $facilities = $query->paginate($request->get('per_page', 15));

        return response()->json($facilities);
    }

    public function store(StoreFacilityRequest $request)
    {
        $data = $request->validated();

        if (isset($data['location']) && is_array($data['location'])) {
            $data['location'] = Point::fromJson(json_encode($data['location']));
        }

        $facility = Facility::create($data);
        $facility->load(['scheme', 'tenant']);

        return response()->json($facility, 201);
    }

    public function show(Facility $facility)
    {
        $facility->load(['scheme', 'tenant', 'attachments']);
        return response()->json($facility);
    }

    public function update(UpdateFacilityRequest $request, Facility $facility)
    {
        $data = $request->validated();

        if (isset($data['location']) && is_array($data['location'])) {
            $data['location'] = Point::fromJson(json_encode($data['location']));
        }

        $facility->update($data);
        $facility->load(['scheme', 'tenant']);

        return response()->json($facility);
    }

    public function destroy(Facility $facility)
    {
        $facility->delete();
        return response()->json(['message' => 'Facility deleted successfully'], 204);
    }

    public function geojson(Request $request)
    {
        $query = Facility::query();
        
        if (auth()->check()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        } else {
            $query->where('tenant_id', 1);
        }

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'location');
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $facilities = $query->limit($request->get('limit', 1000))->get();

        return response()->json(SpatialQueryService::buildMapLayers('facility', $facilities));
    }

    public function export(Request $request)
    {
        $query = Facility::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'location');
        }

        $facilities = $query->limit($request->get('limit', 10000))->get();

        return response()->json(SpatialQueryService::buildMapLayers('facility', $facilities))
            ->header('Content-Disposition', 'attachment; filename="facilities.geojson"');
    }
}
