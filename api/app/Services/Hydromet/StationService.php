<?php

namespace App\Services\Hydromet;

use App\Models\HydrometStation;
use App\Models\HydrometSensor;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use MatanYadaev\EloquentSpatial\Objects\Point;

class StationService
{
    public function list(
        ?string $schemeId = null,
        ?string $stationTypeId = null,
        ?bool $activeOnly = null,
        ?string $search = null,
        int $perPage = 50
    ): LengthAwarePaginator {
        $query = HydrometStation::with(['stationType', 'datasource', 'scheme']);

        if ($schemeId) {
            $query->where('scheme_id', $schemeId);
        }

        if ($stationTypeId) {
            $query->where('station_type_id', $stationTypeId);
        }

        if ($activeOnly !== null) {
            $query->where('active', $activeOnly);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('code', 'ILIKE', "%{$search}%");
            });
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function create(array $data): HydrometStation
    {
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $data['location'] = new Point($data['latitude'], $data['longitude'], 4326);
            unset($data['latitude'], $data['longitude']);
        }

        return HydrometStation::create($data);
    }

    public function update(string $id, array $data): HydrometStation
    {
        $station = HydrometStation::findOrFail($id);

        if (isset($data['latitude']) && isset($data['longitude'])) {
            $data['location'] = new Point($data['latitude'], $data['longitude'], 4326);
            unset($data['latitude'], $data['longitude']);
        }

        $station->update($data);
        return $station->fresh(['stationType', 'datasource', 'scheme', 'sensors']);
    }

    public function delete(string $id): bool
    {
        $station = HydrometStation::findOrFail($id);
        return $station->delete();
    }

    public function getById(string $id): HydrometStation
    {
        return HydrometStation::with(['stationType', 'datasource', 'scheme', 'sensors.parameter'])
            ->findOrFail($id);
    }

    public function getStationsNearPoint(Point $point, float $radiusMeters = 10000): Collection
    {
        return HydrometStation::whereNotNull('location')
            ->selectRaw('*, ST_Distance(location::geography, ?::geography) as distance', [$point])
            ->whereRaw('ST_DWithin(location::geography, ?::geography, ?)', [$point, $radiusMeters])
            ->where('active', true)
            ->orderBy('distance')
            ->get();
    }

    public function getStationsInBounds(float $minLat, float $minLon, float $maxLat, float $maxLon): Collection
    {
        $polygon = "POLYGON(({$minLon} {$minLat}, {$maxLon} {$minLat}, {$maxLon} {$maxLat}, {$minLon} {$maxLat}, {$minLon} {$minLat}))";
        
        return HydrometStation::whereNotNull('location')
            ->selectRaw('*, location')
            ->whereRaw("ST_Within(location, ST_GeomFromText(?, 4326))", [$polygon])
            ->where('active', true)
            ->with(['stationType', 'sensors'])
            ->get();
    }

    public function addSensor(string $stationId, array $data): HydrometSensor
    {
        $data['station_id'] = $stationId;
        return HydrometSensor::create($data);
    }

    public function updateSensor(string $sensorId, array $data): HydrometSensor
    {
        $sensor = HydrometSensor::findOrFail($sensorId);
        $sensor->update($data);
        return $sensor->fresh(['parameter', 'station']);
    }

    public function deleteSensor(string $sensorId): bool
    {
        $sensor = HydrometSensor::findOrFail($sensorId);
        return $sensor->delete();
    }

    public function getSensorsByStation(string $stationId, ?bool $activeOnly = null): Collection
    {
        $query = HydrometSensor::where('station_id', $stationId)
            ->with(['parameter']);

        if ($activeOnly !== null) {
            $query->where('active', $activeOnly);
        }

        return $query->orderBy('id')->get();
    }

    public function activateStation(string $id): HydrometStation
    {
        $station = HydrometStation::findOrFail($id);
        $station->update(['active' => true]);
        return $station;
    }

    public function deactivateStation(string $id): HydrometStation
    {
        $station = HydrometStation::findOrFail($id);
        $station->update(['active' => false]);
        return $station;
    }
}
