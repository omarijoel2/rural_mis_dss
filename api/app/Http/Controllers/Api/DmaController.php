<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDmaRequest;
use App\Http\Requests\UpdateDmaRequest;
use App\Models\Dma;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class DmaController extends Controller
{
    public function index(Request $request)
    {
        $query = Dma::with(['scheme', 'tenant']);

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
}
