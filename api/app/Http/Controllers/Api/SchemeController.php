<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchemeRequest;
use App\Http\Requests\UpdateSchemeRequest;
use App\Models\Scheme;
use App\Services\SpatialQueryService;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class SchemeController extends Controller
{
    public function index(Request $request)
    {
        $query = Scheme::query();
        
        if (auth()->user()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }
        
        $query->with(['organization', 'tenant']);

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

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        if ($request->has('near')) {
            [$lat, $lng, $radius] = explode(',', $request->near);
            $query = SpatialQueryService::applyNearFilter($query, (float)$lat, (float)$lng, (float)$radius, 'centroid');
        }

        $schemes = $query->paginate($request->get('per_page', 15));

        return response()->json($schemes);
    }

    public function geojson(Request $request)
    {
        $query = Scheme::query();
        
        if (auth()->check()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        } else {
            $query->where('tenant_id', 1);
        }

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $schemes = $query->limit($request->get('limit', 1000))->get();

        return response()->json(SpatialQueryService::buildMapLayers('scheme', $schemes));
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

    public function importGeojson(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json,geojson|max:10240',
            'type_field' => 'nullable|string',
            'name_field' => 'required|string',
        ]);

        $content = file_get_contents($request->file('file')->getRealPath());
        $geojson = json_decode($content, true);

        if (!isset($geojson['features'])) {
            return response()->json(['error' => 'Invalid GeoJSON format'], 400);
        }

        if (count($geojson['features']) > 500) {
            return response()->json(['error' => 'Maximum 500 features allowed per import'], 400);
        }

        $imported = 0;
        $errors = [];

        foreach ($geojson['features'] as $index => $feature) {
            try {
                $properties = $feature['properties'] ?? [];
                $geometry = $feature['geometry'] ?? null;

                if (!$geometry) {
                    $errors[] = "Feature {$index}: Missing geometry";
                    continue;
                }

                if (!in_array($geometry['type'], ['Polygon', 'MultiPolygon'])) {
                    $errors[] = "Feature {$index}: Invalid geometry type '{$geometry['type']}'. Expected Polygon or MultiPolygon.";
                    continue;
                }

                $data = [
                    'tenant_id' => auth()->user()->tenant_id,
                    'name' => $properties[$request->name_field] ?? 'Unnamed',
                    'code' => $properties['code'] ?? 'AUTO-' . uniqid(),
                    'type' => $properties[$request->type_field ?? 'type'] ?? 'rural',
                    'status' => $properties['status'] ?? 'active',
                ];

                $polygon = Polygon::fromJson(json_encode($geometry));
                if (!$polygon) {
                    $errors[] = "Feature {$index}: Invalid polygon geometry";
                    continue;
                }
                
                $data['geom'] = $polygon;

                Scheme::create($data);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Feature {$index}: " . $e->getMessage();
            }
        }

        return response()->json([
            'imported' => $imported,
            'total' => count($geojson['features']),
            'errors' => $errors,
        ]);
    }

    public function export(Request $request)
    {
        $query = Scheme::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        $schemes = $query->limit($request->get('limit', 10000))->get();

        $format = $request->get('format', 'geojson');

        if ($format === 'csv') {
            $csv = "ID,Code,Name,Type,Status,Population,Centroid Lat,Centroid Lng,Created At\n";
            foreach ($schemes as $scheme) {
                $centroidLat = $scheme->centroid ? $scheme->centroid->latitude : '';
                $centroidLng = $scheme->centroid ? $scheme->centroid->longitude : '';
                $csv .= sprintf(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    $scheme->id,
                    $scheme->code,
                    '"' . str_replace('"', '""', $scheme->name) . '"',
                    $scheme->type,
                    $scheme->status,
                    $scheme->population_estimate ?? '',
                    $centroidLat,
                    $centroidLng,
                    $scheme->created_at
                );
            }
            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="schemes.csv"');
        }

        return response()->json(SpatialQueryService::buildMapLayers('scheme', $schemes))
            ->header('Content-Disposition', 'attachment; filename="schemes.geojson"');
    }
}
