<?php

namespace App\Services\CoreOps;

use App\Models\PumpSchedule;
use App\Models\Asset;
use Illuminate\Support\Collection;

class PumpOptimizer
{
    public function optimizeSchedule(Asset $pump, array $constraints): array
    {
        $targetVolume = $constraints['target_volume_m3'] ?? 0;
        $powerTariffs = $constraints['power_tariffs'] ?? [];
        $reservoirLimits = $constraints['reservoir_limits'] ?? [];

        $offPeakHours = $this->getOffPeakHours($powerTariffs);
        $pumpCapacity = $this->getPumpCapacity($pump);

        $requiredHours = $targetVolume / $pumpCapacity;
        $scheduledHours = min($requiredHours, count($offPeakHours));

        $optimizedWindows = [];
        for ($i = 0; $i < $scheduledHours; $i++) {
            $hour = $offPeakHours[$i];
            $optimizedWindows[] = [
                'start_hour' => $hour,
                'duration_hours' => 1,
                'volume_m3' => $pumpCapacity,
                'tariff_band' => $this->getTariffBand($hour, $powerTariffs),
            ];
        }

        $totalVolume = $scheduledHours * $pumpCapacity;
        $totalCost = $this->estimateCost($optimizedWindows, $powerTariffs);

        return [
            'windows' => $optimizedWindows,
            'total_volume_m3' => $totalVolume,
            'estimated_cost' => $totalCost,
            'efficiency_pct' => $targetVolume > 0 ? ($totalVolume / $targetVolume) * 100 : 0,
        ];
    }

    private function getOffPeakHours(array $tariffs): array
    {
        if (empty($tariffs)) {
            return range(22, 23) + range(0, 5);
        }

        $offPeak = [];
        for ($hour = 0; $hour < 24; $hour++) {
            $band = $this->getTariffBand($hour, $tariffs);
            if ($band === 'off_peak') {
                $offPeak[] = $hour;
            }
        }

        return $offPeak;
    }

    private function getTariffBand(int $hour, array $tariffs): string
    {
        foreach ($tariffs as $tariff) {
            if ($hour >= $tariff['start_hour'] && $hour < $tariff['end_hour']) {
                return $tariff['band'];
            }
        }

        return 'standard';
    }

    private function getPumpCapacity(Asset $pump): float
    {
        return $pump->specs['rated_flow_m3h'] ?? 100;
    }

    private function estimateCost(array $windows, array $tariffs): float
    {
        $cost = 0;
        foreach ($windows as $window) {
            $tariffRate = 50;
            foreach ($tariffs as $tariff) {
                if ($tariff['band'] === $window['tariff_band']) {
                    $tariffRate = $tariff['rate'];
                    break;
                }
            }
            $cost += $window['duration_hours'] * $tariffRate;
        }

        return $cost;
    }
}
