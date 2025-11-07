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
        $query = Dma::where('tenant_id', auth()->user()->tenant_id)
            ->with(['scheme', 'tenant']);

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
        $query = Dma::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        $dmas = $query->limit($request->get('limit', 1000))->get();

        return response()->json(SpatialQueryService::buildMapLayers('dma', $dmas));
    }

    public function export(Request $request)
    {
        $query = Dma::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('bbox')) {
            $query = SpatialQueryService::applyBboxFilter($query, $request->bbox, 'geom');
        }

        $dmas = $query->limit($request->get('limit', 10000))->get();

        return response()->json(SpatialQueryService::buildMapLayers('dma', $dmas))
            ->header('Content-Disposition', 'attachment; filename="dmas.geojson"');
    }
}
