<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetLocation;
use Illuminate\Support\Collection;
use MatanYadaev\EloquentSpatial\Objects\Point;

class AssetService
{
    public function getAssetHierarchy(?string $parentId = null): Collection
    {
        return Asset::with(['assetClass', 'scheme', 'dma'])
            ->where('parent_id', $parentId)
            ->orderBy('code')
            ->get();
    }

    public function getAssetDescendants(string $assetId): Collection
    {
        $descendants = collect();
        $children = Asset::where('parent_id', $assetId)->get();
        
        foreach ($children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($this->getAssetDescendants($child->id));
        }
        
        return $descendants;
    }

    public function getAssetAncestors(string $assetId): Collection
    {
        $ancestors = collect();
        $asset = Asset::find($assetId);
        
        while ($asset && $asset->parent_id) {
            $parent = Asset::find($asset->parent_id);
            if ($parent) {
                $ancestors->push($parent);
                $asset = $parent;
            } else {
                break;
            }
        }
        
        return $ancestors->reverse();
    }

    public function getCurrentLocation(string $assetId): ?AssetLocation
    {
        return AssetLocation::where('asset_id', $assetId)
            ->where(function ($q) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', now());
            })
            ->where('effective_from', '<=', now())
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    public function getLocationHistory(string $assetId): Collection
    {
        return AssetLocation::where('asset_id', $assetId)
            ->orderBy('effective_from', 'desc')
            ->get();
    }

    public function relocateAsset(string $assetId, Point $newLocation, ?\DateTime $effectiveFrom = null): AssetLocation
    {
        $effectiveFrom = $effectiveFrom ?? now();
        
        AssetLocation::where('asset_id', $assetId)
            ->whereNull('effective_to')
            ->update(['effective_to' => $effectiveFrom]);
        
        return AssetLocation::create([
            'asset_id' => $assetId,
            'effective_from' => $effectiveFrom,
            'geom' => $newLocation
        ]);
    }

    public function getAssetsNearPoint(Point $point, float $radiusMeters = 1000): Collection
    {
        return Asset::whereNotNull('geom')
            ->selectRaw('*, ST_Distance(geom::geography, ?::geography) as distance', [$point])
            ->whereRaw('ST_DWithin(geom::geography, ?::geography, ?)', [$point, $radiusMeters])
            ->orderBy('distance')
            ->get();
    }

    public function getAssetTreeAsJson(string $rootId): array
    {
        $root = Asset::with('assetClass')->find($rootId);
        
        if (!$root) {
            return [];
        }
        
        return $this->buildTreeNode($root);
    }

    protected function buildTreeNode(Asset $asset): array
    {
        $children = Asset::where('parent_id', $asset->id)->with('assetClass')->get();
        
        return [
            'id' => $asset->id,
            'code' => $asset->code,
            'name' => $asset->name,
            'class' => $asset->assetClass?->name,
            'status' => $asset->status,
            'children' => $children->map(fn($child) => $this->buildTreeNode($child))->toArray()
        ];
    }

    public function getAssetsWithActivePM(): Collection
    {
        return Asset::whereHas('pmPolicies', function ($q) {
            $q->where('is_active', true);
        })->with(['pmPolicies', 'assetClass'])->get();
    }

    public function calculateAssetUtilization(string $assetId, \DateTime $from, \DateTime $to): array
    {
        $asset = Asset::find($assetId);
        
        if (!$asset) {
            return ['error' => 'Asset not found'];
        }
        
        $totalHours = $from->diff($to)->days * 24;
        
        $downtime = $asset->workOrders()
            ->whereIn('kind', ['cm', 'emergency'])
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->get()
            ->sum(function ($wo) {
                return $wo->started_at && $wo->completed_at 
                    ? $wo->started_at->diffInHours($wo->completed_at) 
                    : 0;
            });
        
        $uptime = $totalHours - $downtime;
        $availability = $totalHours > 0 ? ($uptime / $totalHours) * 100 : 0;
        
        return [
            'asset_id' => $assetId,
            'period' => ['from' => $from, 'to' => $to],
            'total_hours' => $totalHours,
            'uptime_hours' => $uptime,
            'downtime_hours' => $downtime,
            'availability_percent' => round($availability, 2)
        ];
    }
}
