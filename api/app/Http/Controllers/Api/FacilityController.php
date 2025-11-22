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
        $query = Facility::query();
        
        if (auth()->check()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        } else {
            // Default to first tenant for public access
            $defaultTenant = \App\Models\Tenant::first();
            if (!$defaultTenant) {
                return response()->json(['data' => [], 'total' => 0, 'per_page' => 15]);
            }
            $query->where('tenant_id', $defaultTenant->id);
        }
        
        $query->with(['scheme', 'tenant']);

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
            // Default to first tenant for public access
            $defaultTenant = \App\Models\Tenant::first();
            if (!$defaultTenant) {
                return response()->json(['error' => 'No tenant found'], 404);
            }
            $query->where('tenant_id', $defaultTenant->id);
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

    public function importGeojson(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json,geojson|max:10240',
            'name_field' => 'required|string',
            'category_field' => 'nullable|string',
            'scheme_id_field' => 'nullable|string',
        ]);

        $content = file_get_contents($request->file('file')->getRealPath());
        $geojson = json_decode($content, true);

        if (!isset($geojson['features'])) {
            return response()->json(['error' => 'Invalid GeoJSON format'], 400);
        }

        if (count($geojson['features']) > 1000) {
            return response()->json(['error' => 'Maximum 1000 facilities allowed per import'], 400);
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

                if ($geometry['type'] !== 'Point') {
                    $errors[] = "Feature {$index}: Invalid geometry type '{$geometry['type']}'. Expected Point.";
                    continue;
                }

                $data = [
                    'tenant_id' => auth()->user()->tenant_id,
                    'name' => $properties[$request->name_field] ?? 'Unnamed Facility',
                    'code' => $properties['code'] ?? 'FAC-' . uniqid(),
                    'category' => $properties[$request->category_field ?? 'category'] ?? 'other',
                    'status' => $properties['status'] ?? 'active',
                ];

                if ($request->has('scheme_id_field') && isset($properties[$request->scheme_id_field])) {
                    $data['scheme_id'] = $properties[$request->scheme_id_field];
                }

                $point = Point::fromJson(json_encode($geometry));
                if (!$point) {
                    $errors[] = "Feature {$index}: Invalid point geometry";
                    continue;
                }
                
                $data['location'] = $point;

                Facility::create($data);
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
        // Determine tenant for export
        if (auth()->check()) {
            $tenantId = auth()->user()->tenant_id;
        } else {
            // Default to first tenant for public access
            $defaultTenant = \App\Models\Tenant::first();
            if (!$defaultTenant) {
                return response()->json(['error' => 'No tenant found'], 404);
            }
            $tenantId = $defaultTenant->id;
        }

        $query = Facility::where('tenant_id', $tenantId);

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'location');
        }

        $facilities = $query->limit($request->get('limit', 10000))->get();

        $format = $request->get('format', 'geojson');

        if ($format === 'csv') {
            $csv = "ID,Code,Name,Category,Scheme ID,Status,Latitude,Longitude,Created At\n";
            foreach ($facilities as $facility) {
                $lat = $facility->location ? $facility->location->latitude : '';
                $lng = $facility->location ? $facility->location->longitude : '';
                $csv .= sprintf(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    $facility->id,
                    $facility->code,
                    '"' . str_replace('"', '""', $facility->name) . '"',
                    $facility->category,
                    $facility->scheme_id ?? '',
                    $facility->status,
                    $lat,
                    $lng,
                    $facility->created_at
                );
            }
            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="facilities.csv"');
        }

        return response()->json(SpatialQueryService::buildMapLayers('facility', $facilities))
            ->header('Content-Disposition', 'attachment; filename="facilities.geojson"');
    }
}
