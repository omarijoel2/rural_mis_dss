<?php

namespace App\Services\Hydromet;

use App\Models\Source;
use App\Models\AbstractionLog;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use MatanYadaev\EloquentSpatial\Objects\Point;

class SourceService
{
    public function list(
        ?string $schemeId = null,
        ?string $kindId = null,
        ?string $statusId = null,
        ?string $search = null,
        int $perPage = 50
    ): LengthAwarePaginator {
        $query = Source::with(['kind', 'status', 'scheme', 'qualityRisk']);

        if ($schemeId) {
            $query->where('scheme_id', $schemeId);
        }

        if ($kindId) {
            $query->where('kind_id', $kindId);
        }

        if ($statusId) {
            $query->where('status_id', $statusId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('code', 'ILIKE', "%{$search}%")
                  ->orWhere('catchment', 'ILIKE', "%{$search}%");
            });
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function create(array $data): Source
    {
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $data['location'] = new Point($data['latitude'], $data['longitude'], 4326);
            unset($data['latitude'], $data['longitude']);
        }

        return Source::create($data);
    }

    public function update(string $id, array $data): Source
    {
        $source = Source::findOrFail($id);

        if (isset($data['latitude']) && isset($data['longitude'])) {
            $data['location'] = new Point($data['latitude'], $data['longitude'], 4326);
            unset($data['latitude'], $data['longitude']);
        }

        $source->update($data);
        return $source->fresh(['kind', 'status', 'scheme', 'qualityRisk']);
    }

    public function delete(string $id): bool
    {
        $source = Source::findOrFail($id);
        return $source->delete();
    }

    public function getById(string $id): Source
    {
        return Source::with(['kind', 'status', 'scheme', 'qualityRisk', 'abstractionLogs'])
            ->findOrFail($id);
    }

    public function getSourcesNearPoint(Point $point, float $radiusMeters = 10000): Collection
    {
        return Source::whereNotNull('location')
            ->selectRaw('*, ST_Distance(location::geography, ?::geography) as distance', [$point])
            ->whereRaw('ST_DWithin(location::geography, ?::geography, ?)', [$point, $radiusMeters])
            ->orderBy('distance')
            ->get();
    }

    public function getSourcesInBounds(float $minLat, float $minLon, float $maxLat, float $maxLon): Collection
    {
        $polygon = "POLYGON(({$minLon} {$minLat}, {$maxLon} {$minLat}, {$maxLon} {$maxLat}, {$minLon} {$maxLat}, {$minLon} {$minLat}))";
        
        return Source::whereNotNull('location')
            ->selectRaw('*, location')
            ->whereRaw("ST_Within(location, ST_GeomFromText(?, 4326))", [$polygon])
            ->with(['kind', 'status'])
            ->get();
    }

    public function logAbstraction(string $sourceId, array $data): AbstractionLog
    {
        $data['source_id'] = $sourceId;
        return AbstractionLog::create($data);
    }

    public function getAbstractionHistory(
        string $sourceId,
        ?\DateTime $startDate = null,
        ?\DateTime $endDate = null
    ): Collection {
        $query = AbstractionLog::where('source_id', $sourceId)
            ->with('logger');

        if ($startDate) {
            $query->where('logged_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('logged_at', '<=', $endDate);
        }

        return $query->orderBy('logged_at', 'desc')->get();
    }

    public function getTotalAbstraction(
        string $sourceId,
        ?\DateTime $startDate = null,
        ?\DateTime $endDate = null
    ): float {
        $query = AbstractionLog::where('source_id', $sourceId);

        if ($startDate) {
            $query->where('logged_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('logged_at', '<=', $endDate);
        }

        return $query->sum('volume_m3');
    }

    public function bulkImport(array $sourcesData): array
    {
        $imported = 0;
        $errors = [];
        $sources = [];

        foreach ($sourcesData as $index => $data) {
            try {
                if (Source::where('code', $data['code'])->exists()) {
                    $errors[] = "Row " . ($index + 1) . ": Source with code '{$data['code']}' already exists";
                    continue;
                }

                $source = $this->create($data);
                $sources[] = $source;
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'errors' => $errors,
            'sources' => $sources,
        ];
    }
}
