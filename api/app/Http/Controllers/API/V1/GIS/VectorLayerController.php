<?php

namespace App\Http\Controllers\API\V1\GIS;

use App\Models\GIS\ShapeFile;
use App\Models\GIS\VectorLayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class VectorLayerController extends Controller
{
    /**
     * List vector layers for a shape file
     */
    public function index(ShapeFile $shapeFile): JsonResponse
    {
        $this->authorize('view', $shapeFile);

        $layers = $shapeFile->vectorLayers()
            ->orderBy('z_index', 'asc')
            ->get();

        return response()->json([
            'data' => $layers,
        ]);
    }

    /**
     * Create vector layer from shape file
     */
    public function store(Request $request, ShapeFile $shapeFile): JsonResponse
    {
        $this->authorize('update', $shapeFile);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'layer_type' => 'required|in:fill,line,circle,symbol',
            'visibility' => 'boolean',
            'opacity' => 'numeric|between:0,1',
            'fill_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'stroke_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'stroke_width' => 'nullable|numeric|min:0',
            'properties_display' => 'nullable|array',
            'filter_config' => 'nullable|array',
            'z_index' => 'nullable|integer',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['source_file_id'] = $shapeFile->id;

        $layer = VectorLayer::create($validated);

        return response()->json([
            'data' => $layer,
            'message' => 'Vector layer created',
        ], 201);
    }

    /**
     * Update vector layer styling
     */
    public function update(Request $request, ShapeFile $shapeFile, VectorLayer $layer): JsonResponse
    {
        $this->authorize('update', $shapeFile);

        if ($layer->source_file_id !== $shapeFile->id) {
            return response()->json([
                'message' => 'Not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'visibility' => 'boolean',
            'opacity' => 'numeric|between:0,1',
            'fill_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'stroke_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'stroke_width' => 'nullable|numeric|min:0',
            'properties_display' => 'nullable|array',
            'filter_config' => 'nullable|array',
            'z_index' => 'nullable|integer',
        ]);

        $layer->update($validated);

        return response()->json([
            'data' => $layer,
            'message' => 'Vector layer updated',
        ]);
    }

    /**
     * Delete vector layer
     */
    public function destroy(ShapeFile $shapeFile, VectorLayer $layer): JsonResponse
    {
        $this->authorize('update', $shapeFile);

        if ($layer->source_file_id !== $shapeFile->id) {
            return response()->json([
                'message' => 'Not found',
            ], 404);
        }

        $layer->delete();

        return response()->json(null, 204);
    }

    /**
     * Get layer configuration for map rendering
     */
    public function getConfig(ShapeFile $shapeFile, VectorLayer $layer): JsonResponse
    {
        $this->authorize('view', $shapeFile);

        if ($layer->source_file_id !== $shapeFile->id) {
            return response()->json([
                'message' => 'Not found',
            ], 404);
        }

        return response()->json([
            'data' => $layer->getLayerConfig(),
        ]);
    }
}
