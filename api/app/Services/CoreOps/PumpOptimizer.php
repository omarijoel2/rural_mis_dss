<?php

namespace App\Services\CoreOps;

use App\Models\PumpSchedule;
use App\Models\Asset;
use App\Models\Scheme;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class PumpOptimizer
{
    /**
     * Optimize pump schedule to minimize energy costs while maintaining storage constraints
     * 
     * Algorithm:
     * 1. Identify off-peak tariff periods
     * 2. Calculate required pumping hours to meet target volume
     * 3. Respect reservoir storage limits (min/max)
     * 4. Prioritize pumping during lowest tariff periods
     * 5. Ensure continuous supply by maintaining minimum storage
     */
    public function optimizeSchedule(Asset $pump, array $constraints): array
    {
        $targetVolume = $constraints['target_volume_m3'] ?? 0;
        $powerTariffs = $constraints['power_tariffs'] ?? $this->getDefaultTariffs();
        $reservoirLimits = $constraints['reservoir_limits'] ?? ['min' => 0, 'max' => 10000];
        $currentStorage = $constraints['current_storage_m3'] ?? $reservoirLimits['min'];
        $dailyDemand = $constraints['daily_demand_m3'] ?? $targetVolume;

        $pumpCapacity = $this->getPumpCapacity($pump);
        $requiredHours = ceil($targetVolume / $pumpCapacity);

        // Get tariff periods sorted by cost (lowest first)
        $sortedPeriods = $this->getSortedTariffPeriods($powerTariffs);
        
        // Initialize optimization state
        $optimizedWindows = [];
        $totalVolume = 0;
        $storageLevel = $currentStorage;
        $hoursScheduled = 0;

        // Greedy algorithm: schedule pumping during cheapest periods first
        foreach ($sortedPeriods as $period) {
            if ($hoursScheduled >= $requiredHours) {
                break;
            }

            $availableHours = $period['duration'];
            $hoursToSchedule = min($availableHours, $requiredHours - $hoursScheduled);

            // Prevent negative hours
            if ($hoursToSchedule <= 0) {
                continue;
            }

            // Check storage constraints
            $volumeToPump = $hoursToSchedule * $pumpCapacity;
            
            // Don't overfill reservoir
            if ($storageLevel + $volumeToPump > $reservoirLimits['max']) {
                $maxVolume = max(0, $reservoirLimits['max'] - $storageLevel);
                if ($maxVolume <= 0) {
                    continue; // Reservoir already full
                }
                // Recalculate hours, ensuring we don't exceed available or remaining
                $hoursToSchedule = min(
                    floor($maxVolume / $pumpCapacity),
                    $availableHours,
                    $requiredHours - $hoursScheduled
                );
                $volumeToPump = $hoursToSchedule * $pumpCapacity;
            }

            if ($hoursToSchedule > 0) {
                // Calculate power consumption: assume pump uses 0.5 kWh per m³
                $powerConsumption = $volumeToPump * 0.5; // kWh
                $energyCost = $powerConsumption * $period['rate']; // Cost in currency
                
                $optimizedWindows[] = [
                    'start_hour' => $period['start_hour'],
                    'duration_hours' => $hoursToSchedule,
                    'volume_m3' => $volumeToPump,
                    'tariff_band' => $period['band'],
                    'tariff_rate' => $period['rate'],
                    'cost' => $energyCost,
                ];

                $totalVolume += $volumeToPump;
                $storageLevel += $volumeToPump;
                $hoursScheduled += $hoursToSchedule;
            }

            // Simulate demand drain during the day
            $storageLevel -= ($dailyDemand / 24) * $period['duration'];
            $storageLevel = max($storageLevel, $reservoirLimits['min']);
        }

        $totalCost = array_sum(array_column($optimizedWindows, 'cost'));
        $peakHoursUsed = $this->calculatePeakHoursUsed($optimizedWindows, $powerTariffs);
        
        // Calculate baseline cost (pumping during standard hours)
        $baselineCost = $this->calculateBaselineCost($requiredHours, $pumpCapacity, $powerTariffs);
        $savings = $baselineCost - $totalCost;

        return [
            'windows' => $optimizedWindows,
            'total_volume_m3' => round($totalVolume, 2),
            'total_hours' => $hoursScheduled,
            'estimated_cost' => round($totalCost, 2),
            'baseline_cost' => round($baselineCost, 2),
            'estimated_savings' => round($savings, 2),
            'peak_hours_avoided' => $this->calculatePeakHoursAvoided($optimizedWindows, $powerTariffs),
            'efficiency_pct' => $targetVolume > 0 ? round(($totalVolume / $targetVolume) * 100, 2) : 0,
            'storage_constraints_met' => $storageLevel >= $reservoirLimits['min'] && $storageLevel <= $reservoirLimits['max'],
        ];
    }

    /**
     * Generate optimized schedules for multiple pumps
     */
    public function optimizeMultiplePumps(Collection $pumps, array $constraints): array
    {
        $allSchedules = [];
        $totalSavings = 0;

        foreach ($pumps as $pump) {
            $result = $this->optimizeSchedule($pump, $constraints);
            
            $allSchedules[] = [
                'pump_id' => $pump->id,
                'pump_name' => $pump->name,
                'windows' => $result['windows'],
                'volume' => $result['total_volume_m3'],
                'cost' => $result['estimated_cost'],
                'savings' => $result['estimated_savings'],
            ];

            $totalSavings += $result['estimated_savings'];
        }

        return [
            'schedules' => $allSchedules,
            'total_savings' => round($totalSavings, 2),
        ];
    }

    /**
     * Get sorted tariff periods by cost (lowest to highest)
     */
    private function getSortedTariffPeriods(array $tariffs): array
    {
        $periods = [];

        foreach ($tariffs as $tariff) {
            $periods[] = [
                'band' => $tariff['band'],
                'rate' => $tariff['rate'],
                'start_hour' => $tariff['start_hour'],
                'end_hour' => $tariff['end_hour'],
                'duration' => $tariff['end_hour'] - $tariff['start_hour'],
            ];
        }

        // Sort by rate (cheapest first)
        usort($periods, function ($a, $b) {
            return $a['rate'] <=> $b['rate'];
        });

        return $periods;
    }

    /**
     * Get default tariff structure (Kenya KPLC-style)
     */
    private function getDefaultTariffs(): array
    {
        return [
            [
                'band' => 'off_peak',
                'rate' => 8.50,
                'start_hour' => 0,
                'end_hour' => 6,
            ],
            [
                'band' => 'off_peak',
                'rate' => 8.50,
                'start_hour' => 22,
                'end_hour' => 24,
            ],
            [
                'band' => 'shoulder',
                'rate' => 12.00,
                'start_hour' => 6,
                'end_hour' => 9,
            ],
            [
                'band' => 'shoulder',
                'rate' => 12.00,
                'start_hour' => 17,
                'end_hour' => 22,
            ],
            [
                'band' => 'peak',
                'rate' => 18.50,
                'start_hour' => 9,
                'end_hour' => 17,
            ],
        ];
    }

    /**
     * Get off-peak hours
     */
    private function getOffPeakHours(array $tariffs): array
    {
        if (empty($tariffs)) {
            return array_merge(range(0, 5), range(22, 23));
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

    /**
     * Get tariff band for a specific hour
     */
    private function getTariffBand(int $hour, array $tariffs): string
    {
        foreach ($tariffs as $tariff) {
            $start = $tariff['start_hour'];
            $end = $tariff['end_hour'];
            
            // Handle wrap-around (e.g., 22:00 - 02:00)
            if ($end < $start) {
                if ($hour >= $start || $hour < $end) {
                    return $tariff['band'];
                }
            } else {
                if ($hour >= $start && $hour < $end) {
                    return $tariff['band'];
                }
            }
        }

        return 'standard';
    }

    /**
     * Get tariff rate for a specific hour
     */
    private function getTariffRate(int $hour, array $tariffs): float
    {
        foreach ($tariffs as $tariff) {
            $start = $tariff['start_hour'];
            $end = $tariff['end_hour'];
            
            if ($end < $start) {
                if ($hour >= $start || $hour < $end) {
                    return $tariff['rate'];
                }
            } else {
                if ($hour >= $start && $hour < $end) {
                    return $tariff['rate'];
                }
            }
        }

        return 12.00; // Default standard rate
    }

    /**
     * Get pump capacity from asset specifications
     */
    private function getPumpCapacity(Asset $pump): float
    {
        return $pump->specs['rated_flow_m3h'] ?? 100;
    }

    /**
     * Calculate baseline cost (pumping during standard hours)
     */
    private function calculateBaselineCost(float $hours, float $capacity, array $tariffs): float
    {
        // Assume baseline pumping during standard/shoulder hours
        $standardRate = 12.00;
        
        foreach ($tariffs as $tariff) {
            if ($tariff['band'] === 'shoulder' || $tariff['band'] === 'standard') {
                $standardRate = $tariff['rate'];
                break;
            }
        }

        // Calculate power consumption: 0.5 kWh per m³
        $volumePerHour = $capacity;
        $totalVolume = $hours * $volumePerHour;
        $powerConsumption = $totalVolume * 0.5; // kWh
        
        return $powerConsumption * $standardRate;
    }

    /**
     * Calculate total peak hours used
     */
    private function calculatePeakHoursUsed(array $windows, array $tariffs): int
    {
        $peakHours = 0;

        foreach ($windows as $window) {
            if ($window['tariff_band'] === 'peak') {
                $peakHours += $window['duration_hours'];
            }
        }

        return $peakHours;
    }

    /**
     * Calculate peak hours avoided (compared to baseline)
     */
    private function calculatePeakHoursAvoided(array $windows, array $tariffs): int
    {
        $totalHours = array_sum(array_column($windows, 'duration_hours'));
        $peakHoursUsed = $this->calculatePeakHoursUsed($windows, $tariffs);
        
        // Assume baseline would use 50% peak hours
        $baselinePeakHours = $totalHours * 0.5;
        
        return max(0, round($baselinePeakHours - $peakHoursUsed));
    }

    /**
     * Estimate total energy cost for windows
     */
    private function estimateCost(array $windows, array $tariffs): float
    {
        $cost = 0;
        foreach ($windows as $window) {
            $cost += $window['cost'] ?? ($window['duration_hours'] * $window['tariff_rate'] ?? 50);
        }

        return $cost;
    }

    /**
     * Create pump schedule records from optimized windows
     */
    public function createSchedulesFromWindows(Asset $pump, array $windows, Carbon $startDate): Collection
    {
        $schedules = collect();

        foreach ($windows as $window) {
            $startAt = $startDate->copy()->addHours($window['start_hour']);
            $endAt = $startAt->copy()->addHours($window['duration_hours']);

            $schedule = PumpSchedule::create([
                'asset_id' => $pump->id,
                'scheme_id' => $pump->scheme_id,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'status' => 'scheduled',
                'source' => 'optimizer',
                'target_volume_m3' => $window['volume_m3'],
                'energy_cost' => $window['cost'],
                'constraints' => [
                    'tariff_band' => $window['tariff_band'],
                    'tariff_rate' => $window['tariff_rate'],
                ],
            ]);

            $schedules->push($schedule);
        }

        return $schedules;
    }
}
