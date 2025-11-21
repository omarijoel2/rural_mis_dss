<?php

namespace App\Services\CoreOps;

use App\Models\NrwSnapshot;
use App\Models\Dma;
use App\Models\Scheme;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NrwCalculator
{
    /**
     * Calculate IWA-compliant water balance
     * 
     * IWA Water Balance Framework:
     * System Input Volume = Authorized Consumption + Water Losses
     * Authorized Consumption = Billed Authorized + Unbilled Authorized
     * Water Losses = Apparent Losses + Real Losses
     * NRW = Unbilled Authorized + Water Losses
     */
    public function calculateWaterBalance(array $data): array
    {
        // Input Components
        $systemInputVolume = $data['system_input_volume_m3'] ?? 0;
        $billedAuthorized = $data['billed_authorized_m3'] ?? 0;
        $unbilledAuthorized = $data['unbilled_authorized_m3'] ?? 0;
        $apparentLosses = $data['apparent_losses_m3'] ?? 0;
        $realLosses = $data['real_losses_m3'] ?? 0;

        // IWA Water Balance Components
        $authorizedConsumption = $billedAuthorized + $unbilledAuthorized;
        $waterLosses = $apparentLosses + $realLosses;
        
        // NRW Calculation (IWA Standard)
        // NRW = Unbilled Authorized + Water Losses
        // OR: NRW = System Input - Billed Authorized Consumption
        $nrw = $unbilledAuthorized + $waterLosses;
        $nrwPct = $systemInputVolume > 0 ? ($nrw / $systemInputVolume) * 100 : 0;

        // Revenue vs Non-Revenue Water
        $revenueWater = $billedAuthorized;
        $nonRevenueWater = $nrw;

        // Financial KPIs
        $billedAuthorizedPct = $systemInputVolume > 0 ? ($billedAuthorized / $systemInputVolume) * 100 : 0;
        $unbilledAuthorizedPct = $systemInputVolume > 0 ? ($unbilledAuthorized / $systemInputVolume) * 100 : 0;
        
        // Loss Components
        $apparentLossesPct = $systemInputVolume > 0 ? ($apparentLosses / $systemInputVolume) * 100 : 0;
        $realLossesPct = $systemInputVolume > 0 ? ($realLosses / $systemInputVolume) * 100 : 0;

        // Calculate Infrastructure Leakage Index (ILI) if UARL is provided
        $ili = null;
        if (isset($data['unavoidable_annual_real_losses_m3']) && $data['unavoidable_annual_real_losses_m3'] > 0) {
            $uarl = $data['unavoidable_annual_real_losses_m3'];
            $ili = $realLosses / $uarl;
        }

        return [
            // System Components
            'system_input_volume_m3' => round($systemInputVolume, 2),
            'authorized_consumption_m3' => round($authorizedConsumption, 2),
            
            // Authorized Consumption Breakdown
            'billed_authorized_m3' => round($billedAuthorized, 2),
            'billed_authorized_pct' => round($billedAuthorizedPct, 2),
            'unbilled_authorized_m3' => round($unbilledAuthorized, 2),
            'unbilled_authorized_pct' => round($unbilledAuthorizedPct, 2),
            
            // Water Losses
            'water_losses_m3' => round($waterLosses, 2),
            'apparent_losses_m3' => round($apparentLosses, 2),
            'apparent_losses_pct' => round($apparentLossesPct, 2),
            'real_losses_m3' => round($realLosses, 2),
            'real_losses_pct' => round($realLossesPct, 2),
            
            // NRW Metrics
            'nrw_m3' => round($nrw, 2),
            'nrw_pct' => round($nrwPct, 2),
            
            // Revenue Metrics
            'revenue_water_m3' => round($revenueWater, 2),
            'non_revenue_water_m3' => round($nonRevenueWater, 2),
            
            // Performance Indicators
            'ili' => $ili ? round($ili, 2) : null,
        ];
    }

    /**
     * Automatically update NRW snapshots for a DMA
     * This should be called daily/weekly by a scheduled job
     */
    public function updateSnapshot(Dma $dma, Carbon $asOf, array $components): NrwSnapshot
    {
        // Calculate water balance
        $balance = $this->calculateWaterBalance($components);

        // Create or update snapshot
        $snapshot = NrwSnapshot::updateOrCreate(
            [
                'dma_id' => $dma->id,
                'as_of' => $asOf->startOfDay(),
            ],
            [
                'system_input_m3' => $balance['system_input_volume_m3'],
                'billed_authorized_m3' => $balance['billed_authorized_m3'],
                'unbilled_authorized_m3' => $balance['unbilled_authorized_m3'],
                'apparent_losses_m3' => $balance['apparent_losses_m3'],
                'real_losses_m3' => $balance['real_losses_m3'],
                'nrw_m3' => $balance['nrw_m3'],
                'nrw_pct' => $balance['nrw_pct'],
                'revenue_water_m3' => $balance['revenue_water_m3'],
                'non_revenue_water_m3' => $balance['non_revenue_water_m3'],
                'ili' => $balance['ili'],
            ]
        );

        return $snapshot;
    }

    /**
     * Bulk update snapshots for all DMAs in a scheme
     */
    public function updateAllSnapshotsForScheme(Scheme $scheme, Carbon $asOf): int
    {
        $updated = 0;

        $dmas = Dma::where('scheme_id', $scheme->id)->get();

        foreach ($dmas as $dma) {
            try {
                // Fetch water balance components from telemetry/billing systems
                $components = $this->fetchComponentsForDma($dma, $asOf);
                
                if ($components) {
                    $this->updateSnapshot($dma, $asOf, $components);
                    $updated++;
                }
            } catch (\Exception $e) {
                \Log::error("Failed to update NRW snapshot for DMA {$dma->id}: {$e->getMessage()}");
            }
        }

        return $updated;
    }

    /**
     * Fetch water balance components from various data sources
     * This integrates with telemetry, billing, and field data
     */
    private function fetchComponentsForDma(Dma $dma, Carbon $asOf): ?array
    {
        // Fetch system input from bulk meters (telemetry)
        $systemInput = DB::table('telemetry_measurements as tm')
            ->join('telemetry_tags as tt', 'tm.telemetry_tag_id', '=', 'tt.id')
            ->join('assets as a', 'tt.asset_id', '=', 'a.id')
            ->where('a.dma_id', $dma->id)
            ->where('a.kind', 'meter')
            ->where('a.subkind', 'bulk')
            ->whereDate('tm.ts', $asOf)
            ->sum('tm.value') ?? 0;

        // Fetch billed consumption from billing system
        $billedAuthorized = DB::table('billing_readings as br')
            ->join('accounts as acc', 'br.account_id', '=', 'acc.id')
            ->join('premises as p', 'acc.premise_id', '=', 'p.id')
            ->where('p.dma_id', $dma->id)
            ->whereYear('br.reading_date', $asOf->year)
            ->whereMonth('br.reading_date', $asOf->month)
            ->sum('br.consumption_m3') ?? 0;

        // Fetch unbilled authorized (e.g., fire hydrants, municipal use)
        $unbilledAuthorized = DB::table('unbilled_consumption')
            ->where('dma_id', $dma->id)
            ->whereDate('consumption_date', $asOf)
            ->sum('volume_m3') ?? 0;

        // Estimate apparent losses (metering errors, unauthorized consumption)
        // Typically 1-3% of system input
        $apparentLosses = $systemInput * 0.02;

        // Calculate real losses (leakage)
        // Real Losses = System Input - Authorized Consumption - Apparent Losses
        $authorizedConsumption = $billedAuthorized + $unbilledAuthorized;
        $realLosses = max(0, $systemInput - $authorizedConsumption - $apparentLosses);

        return [
            'system_input_volume_m3' => $systemInput,
            'billed_authorized_m3' => $billedAuthorized,
            'unbilled_authorized_m3' => $unbilledAuthorized,
            'apparent_losses_m3' => $apparentLosses,
            'real_losses_m3' => $realLosses,
        ];
    }

    /**
     * Calculate NRW trend over time
     */
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
                'real_losses_m3' => $snapshot->real_losses_m3,
                'apparent_losses_m3' => $snapshot->apparent_losses_m3,
            ];
        }

        return $trend;
    }

    /**
     * Estimate annual financial savings from NRW reduction
     */
    public function estimateAnnualSavings(float $m3dSavings, float $tariffPerM3 = 50): float
    {
        $annualVolume = $m3dSavings * 365;
        return $annualVolume * $tariffPerM3;
    }

    /**
     * Calculate performance benchmarks (IWA standards)
     */
    public function calculateBenchmarks(Dma $dma): array
    {
        $latestSnapshot = NrwSnapshot::where('dma_id', $dma->id)
            ->latest('as_of')
            ->first();

        if (!$latestSnapshot) {
            return [
                'status' => 'no_data',
                'message' => 'No NRW data available',
            ];
        }

        // IWA Performance Bands for NRW %
        $nrwPct = $latestSnapshot->nrw_pct;
        
        if ($nrwPct < 10) {
            $performanceBand = 'A - Excellent';
        } elseif ($nrwPct < 20) {
            $performanceBand = 'B - Good';
        } elseif ($nrwPct < 30) {
            $performanceBand = 'C - Fair';
        } elseif ($nrwPct < 40) {
            $performanceBand = 'D - Poor';
        } else {
            $performanceBand = 'E - Unacceptable';
        }

        // ILI Performance Rating
        $ili = $latestSnapshot->ili;
        $iliRating = 'Unknown';
        
        if ($ili !== null) {
            if ($ili < 1) {
                $iliRating = 'A - Technical Limit';
            } elseif ($ili < 2) {
                $iliRating = 'B - Infrastructure well maintained';
            } elseif ($ili < 4) {
                $iliRating = 'C - Tolerable';
            } elseif ($ili < 8) {
                $iliRating = 'D - Poor';
            } else {
                $iliRating = 'E - Very Poor';
            }
        }

        return [
            'nrw_pct' => $nrwPct,
            'performance_band' => $performanceBand,
            'ili' => $ili,
            'ili_rating' => $iliRating,
            'as_of' => $latestSnapshot->as_of->format('Y-m-d'),
        ];
    }
}
