<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchemeRequest;
use App\Http\Requests\UpdateSchemeRequest;
use App\Models\Scheme;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class SchemeController extends Controller
{
    public function index(Request $request)
    {
        $query = Scheme::with(['organization', 'tenant']);

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('org_id')) {
            $query->where('org_id', $request->org_id);
        }

        $schemes = $query->paginate($request->get('per_page', 15));

        return response()->json($schemes);
    }

    public function store(StoreSchemeRequest $request)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        if (isset($data['centroid']) && is_array($data['centroid'])) {
            $data['centroid'] = Point::fromJson(json_encode($data['centroid']));
        }

        $scheme = Scheme::create($data);
        $scheme->load(['organization', 'tenant']);

        return response()->json($scheme, 201);
    }

    public function show(Scheme $scheme)
    {
        $scheme->load(['organization', 'tenant', 'facilities', 'dmas', 'pipelines', 'zones']);
        return response()->json($scheme);
    }

    public function update(UpdateSchemeRequest $request, Scheme $scheme)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        if (isset($data['centroid']) && is_array($data['centroid'])) {
            $data['centroid'] = Point::fromJson(json_encode($data['centroid']));
        }

        $scheme->update($data);
        $scheme->load(['organization', 'tenant']);

        return response()->json($scheme);
    }

    public function destroy(Scheme $scheme)
    {
        $scheme->delete();
        return response()->json(['message' => 'Scheme deleted successfully'], 204);
    }
}
