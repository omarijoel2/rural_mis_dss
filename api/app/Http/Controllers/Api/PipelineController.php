<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePipelineRequest;
use App\Http\Requests\UpdatePipelineRequest;
use App\Models\Pipeline;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\LineString;

class PipelineController extends Controller
{
    public function index(Request $request)
    {
        $query = Pipeline::with(['scheme', 'tenant']);
        
        if (auth()->user()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('material')) {
            $query->where('material', $request->material);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%");
            });
        }

        $pipelines = $query->paginate($request->get('per_page', 15));

        return response()->json($pipelines);
    }

    public function store(StorePipelineRequest $request)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = LineString::fromJson(json_encode($data['geom']));
        }

        $pipeline = Pipeline::create($data);
        $pipeline->load(['scheme', 'tenant']);

        return response()->json($pipeline, 201);
    }

    public function show(Pipeline $pipeline)
    {
        $pipeline->load(['scheme', 'tenant']);
        return response()->json($pipeline);
    }

    public function update(UpdatePipelineRequest $request, Pipeline $pipeline)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = LineString::fromJson(json_encode($data['geom']));
        }

        $pipeline->update($data);
        $pipeline->load(['scheme', 'tenant']);

        return response()->json($pipeline);
    }

    public function destroy(Pipeline $pipeline)
    {
        $pipeline->delete();
        return response()->json(['message' => 'Pipeline deleted successfully'], 204);
    }
}
