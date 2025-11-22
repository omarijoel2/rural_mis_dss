<?php

namespace App\Http\Controllers\API\V1\GIS;

use App\Models\GIS\ShapeFile;
use App\Services\GIS\ShapeFileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class ShapeFileController extends Controller
{
    protected ShapeFileService $shapeFileService;

    public function __construct(ShapeFileService $shapeFileService)
    {
        $this->shapeFileService = $shapeFileService;
    }

    /**
     * List all shape files for current tenant
     */
    public function index(Request $request): JsonResponse
    {
        $query = ShapeFile::forTenant();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $shapeFiles = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($shapeFiles);
    }

    /**
     * Upload and process shape file
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:zip,shp,geojson,json,gpkg',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'projection_crs' => 'nullable|string',
        ]);

        try {
            $shapeFile = $this->shapeFileService->processUploadedFile(
                $request->file('file'),
                $validated,
                auth()->user()->tenant_id,
                auth()->id()
            );

            return response()->json([
                'data' => $shapeFile,
                'message' => 'Shape file uploaded and processing',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload shape file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get shape file details
     */
    public function show(ShapeFile $shapeFile): JsonResponse
    {
        $this->authorize('view', $shapeFile);

        return response()->json([
            'data' => $shapeFile->load(['uploadedBy', 'vectorLayers']),
        ]);
    }

    /**
     * Update shape file metadata
     */
    public function update(Request $request, ShapeFile $shapeFile): JsonResponse
    {
        $this->authorize('update', $shapeFile);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $shapeFile->update($validated);

        return response()->json([
            'data' => $shapeFile,
            'message' => 'Shape file updated',
        ]);
    }

    /**
     * Delete shape file
     */
    public function destroy(ShapeFile $shapeFile): JsonResponse
    {
        $this->authorize('delete', $shapeFile);

        // Delete associated file from storage
        if ($shapeFile->file_path) {
            Storage::disk('gis')->delete($shapeFile->file_path);
        }

        // Delete associated vector layers
        $shapeFile->vectorLayers()->delete();

        $shapeFile->delete();

        return response()->json(null, 204);
    }

    /**
     * Get shape file as GeoJSON preview
     */
    public function getGeoJsonPreview(ShapeFile $shapeFile): JsonResponse
    {
        $this->authorize('view', $shapeFile);

        if ($shapeFile->status !== 'processed') {
            return response()->json([
                'message' => 'Shape file not yet processed',
            ], 400);
        }

        try {
            $geoJson = $this->shapeFileService->getGeoJson($shapeFile);
            return response()->json($geoJson);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate GeoJSON',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download shape file
     */
    public function download(ShapeFile $shapeFile)
    {
        $this->authorize('view', $shapeFile);

        if (!$shapeFile->file_path || !Storage::disk('gis')->exists($shapeFile->file_path)) {
            return response()->json([
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk('gis')->download($shapeFile->file_path);
    }
}
