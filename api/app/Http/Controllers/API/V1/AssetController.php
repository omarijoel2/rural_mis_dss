<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Services\AssetService;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;

class AssetController extends Controller
{
    protected AssetService $assetService;

    public function __construct(AssetService $assetService)
    {
        $this->assetService = $assetService;
    }

    public function index(Request $request)
    {
        $query = Asset::with(['assetClass', 'scheme', 'dma', 'parent']);

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%")
                  ->orWhere('name', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        $assets = $query->paginate($request->get('per_page', 15));

        return response()->json($assets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'class_id' => 'required|integer|exists:asset_classes,id',
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'parent_id' => 'nullable|integer|exists:assets,id',
            'status' => 'required|in:active,inactive,retired,under_maintenance',
            'install_date' => 'nullable|date',
            'barcode' => 'nullable|string|max:100',
            'serial' => 'nullable|string|max:100',
            'manufacturer' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'specs' => 'nullable|array',
            'geom' => 'nullable|array'
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        if (isset($validated['geom']) && is_array($validated['geom'])) {
            $validated['geom'] = Point::fromJson(json_encode($validated['geom']));
        }

        $asset = Asset::create($validated);
        $asset->load(['assetClass', 'scheme', 'dma']);

        return response()->json($asset, 201);
    }

    public function show(Asset $asset)
    {
        $asset->load(['assetClass', 'scheme', 'dma', 'parent', 'children', 'workOrders', 'pmPolicies']);
        return response()->json($asset);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'code' => 'string|max:50',
            'name' => 'string|max:255',
            'class_id' => 'integer|exists:asset_classes,id',
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'parent_id' => 'nullable|integer|exists:assets,id',
            'status' => 'in:active,inactive,retired,under_maintenance',
            'install_date' => 'nullable|date',
            'barcode' => 'nullable|string|max:100',
            'serial' => 'nullable|string|max:100',
            'manufacturer' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'specs' => 'nullable|array',
            'geom' => 'nullable|array'
        ]);

        if (isset($validated['geom']) && is_array($validated['geom'])) {
            $validated['geom'] = Point::fromJson(json_encode($validated['geom']));
        }

        $asset->update($validated);
        $asset->load(['assetClass', 'scheme', 'dma']);

        return response()->json($asset);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return response()->json(['message' => 'Asset deleted successfully'], 204);
    }

    public function tree(Request $request)
    {
        $parentId = $request->get('parent_id');
        $hierarchy = $this->assetService->getAssetHierarchy($parentId);
        return response()->json($hierarchy);
    }

    public function descendants(Asset $asset)
    {
        $descendants = $this->assetService->getAssetDescendants($asset->id);
        return response()->json($descendants);
    }

    public function ancestors(Asset $asset)
    {
        $ancestors = $this->assetService->getAssetAncestors($asset->id);
        return response()->json($ancestors);
    }

    public function locationHistory(Asset $asset)
    {
        $history = $this->assetService->getLocationHistory($asset->id);
        return response()->json($history);
    }

    public function nearbyAssets(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius' => 'nullable|numeric|min:0|max:50000'
        ]);

        $point = new Point($validated['latitude'], $validated['longitude']);
        $radius = $validated['radius'] ?? 1000;

        $assets = $this->assetService->getAssetsNearPoint($point, $radius);
        return response()->json($assets);
    }

    public function utilization(Asset $asset, Request $request)
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after:from'
        ]);

        $from = new \DateTime($validated['from']);
        $to = new \DateTime($validated['to']);

        $utilization = $this->assetService->calculateAssetUtilization($asset->id, $from, $to);
        return response()->json($utilization);
    }
}
