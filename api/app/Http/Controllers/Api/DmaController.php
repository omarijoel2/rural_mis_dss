<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDmaRequest;
use App\Http\Requests\UpdateDmaRequest;
use App\Models\Dma;
use App\Services\SpatialQueryService;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class DmaController extends Controller
{
    public function index(Request $request)
    {
        $query = Dma::query();
        
        if (auth()->user()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }
        
        $query->with(['scheme', 'tenant']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
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
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        $dmas = $query->paginate($request->get('per_page', 15));

        return response()->json($dmas);
    }

    public function store(StoreDmaRequest $request)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        $dma = Dma::create($data);
        $dma->load(['scheme', 'tenant']);

        return response()->json($dma, 201);
    }

    public function show(Dma $dma)
    {
        $dma->load(['scheme', 'tenant']);
        return response()->json($dma);
    }

    public function update(UpdateDmaRequest $request, Dma $dma)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        $dma->update($data);
        $dma->load(['scheme', 'tenant']);

        return response()->json($dma);
    }

    public function destroy(Dma $dma)
    {
        $dma->delete();
        return response()->json(['message' => 'DMA deleted successfully'], 204);
    }

    public function geojson(Request $request)
    {
        $query = Dma::query();
        
        if (auth()->check()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        } else {
            $query->where('tenant_id', 1);
        }

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        $dmas = $query->limit($request->get('limit', 1000))->get();

        return response()->json(SpatialQueryService::buildMapLayers('dma', $dmas));
    }

    public function importGeojson(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json,geojson|max:10240',
            'name_field' => 'required|string',
            'scheme_id_field' => 'nullable|string',
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
                    'name' => $properties[$request->name_field] ?? 'Unnamed DMA',
                    'code' => $properties['code'] ?? 'DMA-' . uniqid(),
                    'status' => $properties['status'] ?? 'active',
                ];

                if ($request->has('scheme_id_field') && isset($properties[$request->scheme_id_field])) {
                    $data['scheme_id'] = $properties[$request->scheme_id_field];
                }

                $polygon = Polygon::fromJson(json_encode($geometry));
                if (!$polygon) {
                    $errors[] = "Feature {$index}: Invalid polygon geometry";
                    continue;
                }
                
                $data['geom'] = $polygon;

                Dma::create($data);
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
        $query = Dma::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        $dmas = $query->limit($request->get('limit', 10000))->get();

        $format = $request->get('format', 'geojson');

        if ($format === 'csv') {
            $csv = "ID,Code,Name,Scheme ID,Status,Centroid Lat,Centroid Lng,Geometry WKT,Created At\n";
            foreach ($dmas as $dma) {
                $centroidLat = '';
                $centroidLng = '';
                $wkt = '';
                
                if ($dma->geom) {
                    $centroid = \DB::selectOne('SELECT ST_AsText(ST_Centroid(ST_GeomFromText(?))) as centroid', [$dma->geom->toWkt()]);
                    if ($centroid && $centroid->centroid) {
                        preg_match('/POINT\(([^ ]+) ([^ ]+)\)/', $centroid->centroid, $matches);
                        if (count($matches) === 3) {
                            $centroidLng = $matches[1];
                            $centroidLat = $matches[2];
                        }
                    }
                    $wkt = '"' . str_replace('"', '""', $dma->geom->toWkt()) . '"';
                }
                
                $csv .= sprintf(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    $dma->id,
                    $dma->code,
                    '"' . str_replace('"', '""', $dma->name) . '"',
                    $dma->scheme_id ?? '',
                    $dma->status,
                    $centroidLat,
                    $centroidLng,
                    $wkt,
                    $dma->created_at
                );
            }
            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="dmas.csv"');
        }

        return response()->json(SpatialQueryService::buildMapLayers('dma', $dmas))
            ->header('Content-Disposition', 'attachment; filename="dmas.geojson"');
    }
}
