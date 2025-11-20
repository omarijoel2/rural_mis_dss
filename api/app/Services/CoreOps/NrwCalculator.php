<?php

namespace App\Services\CoreOps;

use App\Models\NrwSnapshot;
use App\Models\Dma;

class NrwCalculator
{
    public function calculateWaterBalance(array $data): array
    {
        $systemInputVolume = $data['system_input_volume_m3'] ?? 0;
        $billedAuthorized = $data['billed_authorized_m3'] ?? 0;
        $unbilledAuthorized = $data['unbilled_authorized_m3'] ?? 0;
        $apparentLosses = $data['apparent_losses_m3'] ?? 0;
        $realLosses = $data['real_losses_m3'] ?? 0;

        $authorizedConsumption = $billedAuthorized + $unbilledAuthorized;
        $waterLosses = $apparentLosses + $realLosses;
        // NRW = System Input - Authorized Consumption (not just billed)
        $nrw = $systemInputVolume - $authorizedConsumption;
        $nrwPct = $systemInputVolume > 0 ? ($nrw / $systemInputVolume) * 100 : 0;

        $revenueWater = $billedAuthorized;
        $nonRevenueWater = $nrw;

        return [
            'system_input_volume_m3' => $systemInputVolume,
            'authorized_consumption_m3' => $authorizedConsumption,
            'billed_authorized_m3' => $billedAuthorized,
            'unbilled_authorized_m3' => $unbilledAuthorized,
            'water_losses_m3' => $waterLosses,
            'apparent_losses_m3' => $apparentLosses,
            'real_losses_m3' => $realLosses,
            'nrw_m3' => $nrw,
            'nrw_pct' => round($nrwPct, 2),
            'revenue_water_m3' => $revenueWater,
            'non_revenue_water_m3' => $nonRevenueWater,
        ];
    }

    public function calculateNrwTrend(Dma $dma, int $months = 12): array
    {
        $snapshots = NrwSnapshot::where('dma_id', $dma->id)
            ->where('as_of', '>=', now()->subMonths($months))
            ->orderBy('as_of')
            ->get();

        $trend = [];
        foreach ($snapshots as $snapshot) {
            $trend[] = [
                'date' => $snapshot->as_of->format('Y-m-d'),
                'nrw_m3' => $snapshot->nrw_m3,
                'nrw_pct' => $snapshot->nrw_pct,
            ];
        }

        return $trend;
    }

    public function estimateAnnualSavings(float $m3dSavings, float $tariffPerM3 = 0): float
    {
        $annualVolume = $m3dSavings * 365;
        return $annualVolume * $tariffPerM3;
    }
}
