<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class SpatialQueryService
{
    public static function applyBboxFilter(Builder $query, string $bbox, string $geometryColumn = 'geom'): Builder
    {
        [$minLng, $minLat, $maxLng, $maxLat] = explode(',', $bbox);
        
        $bboxPolygon = new Polygon([
            new LineString([
                new Point($minLat, $minLng),
                new Point($minLat, $maxLng),
                new Point($maxLat, $maxLng),
                new Point($maxLat, $minLng),
                new Point($minLat, $minLng),
            ], 4326)
        ], 4326);

        return $query->whereIntersects($geometryColumn, $bboxPolygon);
    }

    public static function applyNearFilter(Builder $query, float $lat, float $lng, float $radiusMeters, string $geometryColumn = 'geom'): Builder
    {
        $point = new Point($lat, $lng, 4326);
        return $query->whereDistance($geometryColumn, $point, '<=', $radiusMeters);
    }

    public static function applyIntersectsFilter(Builder $query, array $geojson, string $geometryColumn = 'geom'): Builder
    {
        $geometry = self::createGeometryFromGeoJSON($geojson);
        return $query->whereIntersects($geometryColumn, $geometry);
    }

    public static function createGeometryFromGeoJSON(array $geojson)
    {
        $type = $geojson['type'] ?? null;
        
        return match($type) {
            'Point' => Point::fromJson(json_encode($geojson)),
            'Polygon', 'MultiPolygon' => Polygon::fromJson(json_encode($geojson)),
            default => throw new \InvalidArgumentException("Unsupported geometry type: {$type}")
        };
    }

    public static function buildMapLayers(string $entityType, $data): array
    {
        return [
            'type' => 'FeatureCollection',
            'features' => $data->map(function ($item) use ($entityType) {
                $geometry = null;
                
                if (isset($item->geom)) {
                    $geometry = json_decode($item->geom->toJson(), true);
                } elseif (isset($item->location)) {
                    $geometry = json_decode($item->location->toJson(), true);
                }

                return [
                    'type' => 'Feature',
                    'id' => $item->id,
                    'geometry' => $geometry,
                    'properties' => [
                        'id' => $item->id,
                        'name' => $item->name,
                        'code' => $item->code ?? null,
                        'type' => $item->type ?? $item->category ?? $entityType,
                        'status' => $item->status,
                    ],
                ];
            })->toArray(),
        ];
    }
}
