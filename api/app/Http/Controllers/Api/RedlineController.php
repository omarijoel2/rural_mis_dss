<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Redline;
use App\Models\SpatialEditLayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class RedlineController extends Controller
{
    public function index(Request $request)
    {
        $query = Redline::with(['spatialEditLayer', 'user']);

        if ($request->has('layer_id')) {
            $query->where('layer_id', $request->layer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('operation_type')) {
            $query->where('operation_type', $request->operation_type);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function show(Redline $redline)
    {
        $redline->load(['spatialEditLayer', 'user']);
        
        return response()->json($redline);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'layer_id' => ['required', 'exists:spatial_edit_layers,id'],
            'feature_id' => ['nullable', 'string'],
            'operation_type' => ['required', Rule::in(['create', 'update', 'delete'])],
            'feature_type' => ['required', 'string', 'max:50'],
            'geometry' => ['required', 'array'],
            'geometry.type' => ['required', 'string', Rule::in(['Point', 'LineString', 'Polygon'])],
            'geometry.coordinates' => ['required', 'array'],
            'before_geom' => ['nullable', 'array'],
            'properties' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        $layer = SpatialEditLayer::findOrFail($validated['layer_id']);

        if ($layer->status !== 'draft') {
            return response()->json([
                'message' => 'Can only add redlines to draft layers'
            ], 422);
        }

        try {
            $geometry = $this->parseGeometry($validated['geometry']);
            $beforeGeometry = $validated['before_geom'] 
                ? $this->parseGeometry($validated['before_geom']) 
                : null;
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Invalid geometry format',
                'error' => $e->getMessage()
            ], 422);
        }

        $redline = Redline::create([
            'layer_id' => $validated['layer_id'],
            'feature_id' => $validated['feature_id'],
            'operation_type' => $validated['operation_type'],
            'feature_type' => $validated['feature_type'],
            'geometry' => $geometry,
            'before_geom' => $beforeGeometry,
            'properties' => $validated['properties'] ?? [],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            'user_id' => auth()->id(),
        ]);

        return response()->json($redline, 201);
    }

    public function update(Request $request, Redline $redline)
    {
        if ($redline->status !== 'pending') {
            return response()->json([
                'message' => 'Can only update pending redlines'
            ], 422);
        }

        if ($redline->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'You can only update your own redlines'
            ], 403);
        }

        $validated = $request->validate([
            'geometry' => ['nullable', 'array'],
            'geometry.type' => ['nullable', 'string', Rule::in(['Point', 'LineString', 'Polygon'])],
            'geometry.coordinates' => ['nullable', 'array'],
            'properties' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        if (isset($validated['geometry'])) {
            try {
                $validated['geometry'] = $this->parseGeometry($validated['geometry']);
            } catch (\InvalidArgumentException $e) {
                return response()->json([
                    'message' => 'Invalid geometry format',
                    'error' => $e->getMessage()
                ], 422);
            }
        }

        $redline->update($validated);

        return response()->json($redline->fresh(['spatialEditLayer', 'user']));
    }

    public function destroy(Redline $redline)
    {
        if ($redline->status !== 'pending') {
            return response()->json([
                'message' => 'Can only delete pending redlines'
            ], 422);
        }

        if ($redline->user_id !== auth()->id() && !auth()->user()->can('delete any redlines')) {
            return response()->json([
                'message' => 'You can only delete your own redlines'
            ], 403);
        }

        $redline->delete();

        return response()->json([
            'message' => 'Redline deleted successfully'
        ]);
    }

    public function bulkCreate(Request $request)
    {
        $validated = $request->validate([
            'layer_id' => ['required', 'exists:spatial_edit_layers,id'],
            'redlines' => ['required', 'array', 'min:1'],
            'redlines.*.feature_id' => ['nullable', 'string'],
            'redlines.*.operation_type' => ['required', Rule::in(['create', 'update', 'delete'])],
            'redlines.*.feature_type' => ['required', 'string', 'max:50'],
            'redlines.*.geometry' => ['required', 'array'],
            'redlines.*.geometry.type' => ['required', 'string', Rule::in(['Point', 'LineString', 'Polygon'])],
            'redlines.*.geometry.coordinates' => ['required', 'array'],
            'redlines.*.properties' => ['nullable', 'array'],
            'redlines.*.notes' => ['nullable', 'string'],
        ]);

        $layer = SpatialEditLayer::findOrFail($validated['layer_id']);

        if ($layer->status !== 'draft') {
            return response()->json([
                'message' => 'Can only add redlines to draft layers'
            ], 422);
        }

        $createdRedlines = [];

        try {
            DB::transaction(function () use ($validated, &$createdRedlines) {
                foreach ($validated['redlines'] as $index => $redlineData) {
                    try {
                        $geometry = $this->parseGeometry($redlineData['geometry']);
                    } catch (\InvalidArgumentException $e) {
                        throw new \InvalidArgumentException(
                            "Invalid geometry in redline at index {$index}: " . $e->getMessage()
                        );
                    }

                    $redline = Redline::create([
                        'layer_id' => $validated['layer_id'],
                        'feature_id' => $redlineData['feature_id'] ?? null,
                        'operation_type' => $redlineData['operation_type'],
                        'feature_type' => $redlineData['feature_type'],
                        'geometry' => $geometry,
                        'properties' => $redlineData['properties'] ?? [],
                        'notes' => $redlineData['notes'] ?? null,
                        'status' => 'pending',
                        'user_id' => auth()->id(),
                    ]);

                    $createdRedlines[] = $redline;
                }
            });
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Invalid geometry format in bulk redlines',
                'error' => $e->getMessage()
            ], 422);
        }

        return response()->json([
            'message' => sprintf('Created %d redlines', count($createdRedlines)),
            'data' => $createdRedlines
        ], 201);
    }

    private function parseGeometry(array $geojsonGeometry)
    {
        $type = $geojsonGeometry['type'];
        $coordinates = $geojsonGeometry['coordinates'];

        switch ($type) {
            case 'Point':
                return new Point($coordinates[1], $coordinates[0]);
                
            case 'LineString':
                $points = array_map(
                    fn($coord) => new Point($coord[1], $coord[0]),
                    $coordinates
                );
                return new LineString($points);
                
            case 'Polygon':
                $rings = array_map(function ($ring) {
                    return array_map(
                        fn($coord) => new Point($coord[1], $coord[0]),
                        $ring
                    );
                }, $coordinates);
                return new Polygon($rings);
                
            default:
                throw new \InvalidArgumentException("Unsupported geometry type: {$type}");
        }
    }
}
