<?php

namespace App\Services\Cmms;

use App\Models\FleetAsset;
use App\Models\FleetServiceSchedule;
use App\Models\FuelLog;
use App\Models\FleetUptimeLog;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FleetService
{
    public function getAllFleetAssets(array $filters = []): Collection
    {
        $query = FleetAsset::with(['operator', 'homeScheme']);
        
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['home_scheme_id'])) {
            $query->where('home_scheme_id', $filters['home_scheme_id']);
        }
        
        return $query->orderBy('registration')->get();
    }

    public function getFleetAsset(int $id): FleetAsset
    {
        return FleetAsset::with(['operator', 'homeScheme', 'serviceSchedules', 'fuelLogs'])->findOrFail($id);
    }

    public function createFleetAsset(array $data): FleetAsset
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        return FleetAsset::create($data);
    }

    public function updateFleetAsset(int $id, array $data): FleetAsset
    {
        $asset = FleetAsset::findOrFail($id);
        $asset->update($data);
        return $asset->fresh(['operator', 'homeScheme']);
    }

    public function createServiceSchedule(int $fleetAssetId, array $data): FleetServiceSchedule
    {
        $data['fleet_asset_id'] = $fleetAssetId;
        
        if (isset($data['interval_km']) && !isset($data['next_service_km'])) {
            $asset = FleetAsset::findOrFail($fleetAssetId);
            $data['next_service_km'] = ($asset->odometer ?? 0) + $data['interval_km'];
        }
        
        if (isset($data['interval_days']) && !isset($data['next_service_date'])) {
            $data['next_service_date'] = Carbon::now()->addDays($data['interval_days']);
        }
        
        return FleetServiceSchedule::create($data);
    }

    public function logFuel(int $fleetAssetId, array $data): FuelLog
    {
        return DB::transaction(function () use ($fleetAssetId, $data) {
            $data['fleet_asset_id'] = $fleetAssetId;
            
            if (isset($data['odometer'])) {
                FleetAsset::where('id', $fleetAssetId)
                    ->update(['odometer' => $data['odometer']]);
            }
            
            if (isset($data['liters']) && isset($data['km_since_last'])) {
                $data['consumption_rate'] = $data['km_since_last'] / $data['liters'];
            }
            
            return FuelLog::create($data);
        });
    }

    public function logUptime(int $fleetAssetId, string $date, float $hoursAvailable, float $hoursDown, ?string $downReason = null): FleetUptimeLog
    {
        $hoursUsed = $hoursAvailable - $hoursDown;
        $uptimePct = $hoursAvailable > 0 ? ($hoursUsed / $hoursAvailable) * 100 : 0;
        
        return FleetUptimeLog::create([
            'fleet_asset_id' => $fleetAssetId,
            'date' => $date,
            'hours_available' => $hoursAvailable,
            'hours_used' => $hoursUsed,
            'hours_down' => $hoursDown,
            'uptime_pct' => round($uptimePct, 2),
            'down_reason' => $downReason
        ]);
    }

    public function getFleetUtilization(string $from, string $to): array
    {
        $logs = FleetUptimeLog::whereBetween('date', [$from, $to])->get();
        
        $totalAvailable = $logs->sum('hours_available');
        $totalUsed = $logs->sum('hours_used');
        $totalDown = $logs->sum('hours_down');
        
        $avgUptime = $logs->avg('uptime_pct');
        
        $byAsset = $logs->groupBy('fleet_asset_id')->map(function ($assetLogs) {
            return [
                'hours_available' => $assetLogs->sum('hours_available'),
                'hours_used' => $assetLogs->sum('hours_used'),
                'hours_down' => $assetLogs->sum('hours_down'),
                'avg_uptime_pct' => round($assetLogs->avg('uptime_pct'), 2)
            ];
        });
        
        return [
            'period' => ['from' => $from, 'to' => $to],
            'total_hours_available' => round($totalAvailable, 2),
            'total_hours_used' => round($totalUsed, 2),
            'total_hours_down' => round($totalDown, 2),
            'avg_uptime_pct' => round($avgUptime, 2),
            'by_asset' => $byAsset
        ];
    }

    public function getFuelEfficiency(int $fleetAssetId, ?int $lastNEntries = 10): array
    {
        $logs = FuelLog::where('fleet_asset_id', $fleetAssetId)
            ->whereNotNull('consumption_rate')
            ->orderBy('filled_at', 'desc')
            ->limit($lastNEntries)
            ->get();
        
        $avgConsumption = $logs->avg('consumption_rate');
        $totalLiters = $logs->sum('liters');
        $totalKm = $logs->sum('km_since_last');
        
        return [
            'fleet_asset_id' => $fleetAssetId,
            'avg_km_per_liter' => round($avgConsumption, 2),
            'total_liters_consumed' => round($totalLiters, 2),
            'total_km_traveled' => round($totalKm, 2),
            'entries_analyzed' => $logs->count()
        ];
    }
}
