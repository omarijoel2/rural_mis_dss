<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class VectorTileController extends Controller
{
    private const EARTH_RADIUS = 6378137.0;
    private const TILE_SIZE = 256;
    private const BUFFER_PERCENT = 10;

    public function schemeTiles(Request $request, int $z, int $x, int $y)
    {
        return $this->generateTile('schemes', 'geom', $z, $x, $y, [
            'id', 'code', 'name', 'type', 'status', 'population_estimate'
        ]);
    }

    public function dmaTiles(Request $request, int $z, int $x, int $y)
    {
        return $this->generateTile('dmas', 'geom', $z, $x, $y, [
            'id', 'code', 'name', 'status', 'nightline_threshold_m3h'
        ]);
    }

    public function facilityTiles(Request $request, int $z, int $x, int $y)
    {
        return $this->generateTile('facilities', 'location', $z, $x, $y, [
            'id', 'code', 'name', 'category', 'status'
        ]);
    }

    public function pipelineTiles(Request $request, int $z, int $x, int $y)
    {
        return $this->generateTile('pipelines', 'geom', $z, $x, $y, [
            'id', 'code', 'material', 'diameter_mm', 'status', 'install_year'
        ]);
    }

    public function networkNodeTiles(Request $request, int $z, int $x, int $y)
    {
        return $this->generateTile('network_nodes', 'geom', $z, $x, $y, [
            'id', 'code', 'name', 'type', 'elevation_m', 'pressure_bar'
        ]);
    }

    public function networkEdgeTiles(Request $request, int $z, int $x, int $y)
    {
        return $this->generateTile('network_edges', 'geom', $z, $x, $y, [
            'id', 'code', 'type', 'material', 'diameter_mm', 'length_m', 'status'
        ]);
    }

    private function generateTile(string $table, string $geomColumn, int $z, int $x, int $y, array $properties)
    {
        $tenantId = auth()->user()->currentTenantId();
        
        if (!$tenantId) {
            return response('Unauthorized', 401);
        }

        $cacheKey = "mvt:{$table}:{$tenantId}:{$z}:{$x}:{$y}";

        $mvt = Cache::remember($cacheKey, 3600, function () use ($table, $geomColumn, $z, $x, $y, $properties, $tenantId) {
            $bbox = $this->tileToBbox($z, $x, $y);
            $buffer = $this->calculateBuffer($z);

            $propertySelects = array_map(function($prop) {
                return "'{$prop}', {$prop}";
            }, $properties);
            $propertySelectStr = implode(', ', $propertySelects);

            $sql = "
                WITH tile_geom AS (
                    SELECT ST_MakeEnvelope(:xmin, :ymin, :xmax, :ymax, 4326) AS bbox
                ),
                mvtgeom AS (
                    SELECT 
                        ST_AsMVTGeom(
                            ST_Transform({$geomColumn}, 3857),
                            ST_Transform((SELECT bbox FROM tile_geom), 3857),
                            :tile_size,
                            :buffer,
                            true
                        ) AS geom,
                        jsonb_build_object({$propertySelectStr}) AS properties
                    FROM {$table}
                    WHERE 
                        tenant_id = :tenant_id
                        AND {$geomColumn} IS NOT NULL
                        AND {$geomColumn} && ST_Expand((SELECT bbox FROM tile_geom), :expand)
                        AND deleted_at IS NULL
                )
                SELECT ST_AsMVT(mvtgeom.*, :layer_name, :tile_size, 'geom') as mvt
                FROM mvtgeom
                WHERE geom IS NOT NULL
            ";

            $result = DB::selectOne($sql, [
                'xmin' => $bbox['xmin'],
                'ymin' => $bbox['ymin'],
                'xmax' => $bbox['xmax'],
                'ymax' => $bbox['ymax'],
                'tenant_id' => $tenantId,
                'tile_size' => self::TILE_SIZE,
                'buffer' => $buffer,
                'expand' => $buffer / self::TILE_SIZE * ($bbox['xmax'] - $bbox['xmin']),
                'layer_name' => $table,
            ]);

            return $result->mvt ?? '';
        });

        if (empty($mvt)) {
            return response('', 204)->header('Content-Type', 'application/x-protobuf');
        }

        return response($mvt)
            ->header('Content-Type', 'application/x-protobuf')
            ->header('Content-Encoding', 'gzip')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    private function tileToBbox(int $z, int $x, int $y): array
    {
        $n = pow(2, $z);
        $lon_min = $x / $n * 360.0 - 180.0;
        $lon_max = ($x + 1) / $n * 360.0 - 180.0;
        
        $lat_rad_min = atan(sinh(pi() * (1 - 2 * ($y + 1) / $n)));
        $lat_rad_max = atan(sinh(pi() * (1 - 2 * $y / $n)));
        
        $lat_min = rad2deg($lat_rad_min);
        $lat_max = rad2deg($lat_rad_max);

        return [
            'xmin' => $lon_min,
            'ymin' => $lat_min,
            'xmax' => $lon_max,
            'ymax' => $lat_max,
        ];
    }

    private function calculateBuffer(int $z): int
    {
        return max(0, (int)(self::TILE_SIZE * self::BUFFER_PERCENT / 100));
    }
}
