<?php

namespace App\Services\Costing;

use App\Models\Costing\CostToServe;
use App\Models\Costing\Actual;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CostToServeService
{
    /**
     * Get cost-to-serve metrics with filters
     */
    public function getMetrics(array $filters = [])
    {
        $query = CostToServe::query();

        if (!empty($filters['period_from']) && !empty($filters['period_to'])) {
            $query->whereBetween('period', [$filters['period_from'], $filters['period_to']]);
        }

        if (!empty($filters['scheme_id'])) {
            $query->where('scheme_id', $filters['scheme_id']);
        }

        if (!empty($filters['dma_id'])) {
            $query->where('dma_id', $filters['dma_id']);
        }

        if (!empty($filters['class'])) {
            $query->where('class', $filters['class']);
        }

        return $query->orderBy('period', 'desc')->get();
    }

    /**
     * Calculate and store cost-to-serve metrics for a period
     */
    public function calculateMetrics(array $data): array
    {
        DB::beginTransaction();
        try {
            $period = $data['period'];
            $schemeId = $data['scheme_id'] ?? null;
            $dmaId = $data['dma_id'] ?? null;
            $class = $data['class'] ?? null;

            // Get production and billing volumes from actuals
            $productionM3 = $data['production_m3'] ?? 0;
            $billedM3 = $data['billed_m3'] ?? 0;

            // Get cost components from actuals
            $costs = $this->getCostComponents($period, $schemeId, $dmaId, $class);

            // Calculate unit costs
            $costPerM3 = $productionM3 > 0 ? $costs['total_opex'] / $productionM3 : 0;
            $revenuePerM3 = $billedM3 > 0 ? ($data['revenue'] ?? 0) / $billedM3 : 0;
            $marginPerM3 = $revenuePerM3 - $costPerM3;

            // Create or update cost-to-serve record
            $metrics = CostToServe::updateOrCreate(
                [
                    'tenant_id' => auth()->user()->tenant_id,
                    'period' => $period,
                    'scheme_id' => $schemeId,
                    'dma_id' => $dmaId,
                    'class' => $class,
                ],
                [
                    'production_m3' => $productionM3,
                    'billed_m3' => $billedM3,
                    'opex_cost' => $costs['opex'],
                    'capex_depr' => $costs['depreciation'],
                    'energy_kwh' => $costs['energy_kwh'],
                    'energy_cost' => $costs['energy_cost'],
                    'chemical_cost' => $costs['chemical_cost'],
                    'other_cost' => $costs['other_cost'],
                    'cost_per_m3' => $costPerM3,
                    'revenue_per_m3' => $revenuePerM3,
                    'margin_per_m3' => $marginPerM3,
                ]
            );

            DB::commit();
            Log::info('Cost-to-serve metrics calculated', [
                'period' => $period,
                'scheme_id' => $schemeId,
                'dma_id' => $dmaId,
                'cost_per_m3' => $costPerM3
            ]);

            return $metrics->toArray();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to calculate cost-to-serve metrics', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Get cost components from actuals for a period
     */
    private function getCostComponents(string $period, ?string $schemeId, ?string $dmaId, ?string $class): array
    {
        $query = Actual::where('period', $period);

        if ($schemeId) {
            $query->where('scheme_id', $schemeId);
        }

        if ($dmaId) {
            $query->where('dma_id', $dmaId);
        }

        if ($class) {
            $query->where('class', $class);
        }

        $actuals = $query->with('glAccount')->get();

        $costs = [
            'opex' => 0,
            'depreciation' => 0,
            'energy_kwh' => 0,
            'energy_cost' => 0,
            'chemical_cost' => 0,
            'other_cost' => 0,
            'total_opex' => 0,
        ];

        foreach ($actuals as $actual) {
            $accountType = $actual->glAccount->type ?? 'expense';
            $amount = abs($actual->amount);

            if ($accountType === 'expense') {
                // Categorize expenses
                $accountCode = $actual->glAccount->code ?? '';

                if (str_contains($accountCode, 'ENERGY') || str_contains($accountCode, 'POWER')) {
                    $costs['energy_cost'] += $amount;
                } elseif (str_contains($accountCode, 'CHEMICAL')) {
                    $costs['chemical_cost'] += $amount;
                } elseif (str_contains($accountCode, 'DEPR')) {
                    $costs['depreciation'] += $amount;
                } else {
                    $costs['other_cost'] += $amount;
                }

                $costs['opex'] += $amount;
            }
        }

        $costs['total_opex'] = $costs['opex'] + $costs['depreciation'];

        return $costs;
    }

    /**
     * Get cost-to-serve summary statistics
     */
    public function getSummaryStats(array $filters = []): array
    {
        $query = CostToServe::query();

        if (!empty($filters['period_from']) && !empty($filters['period_to'])) {
            $query->whereBetween('period', [$filters['period_from'], $filters['period_to']]);
        }

        if (!empty($filters['scheme_id'])) {
            $query->where('scheme_id', $filters['scheme_id']);
        }

        $stats = $query->selectRaw('
            AVG(cost_per_m3) as avg_cost_per_m3,
            MIN(cost_per_m3) as min_cost_per_m3,
            MAX(cost_per_m3) as max_cost_per_m3,
            AVG(margin_per_m3) as avg_margin_per_m3,
            SUM(production_m3) as total_production_m3,
            SUM(billed_m3) as total_billed_m3,
            SUM(opex_cost) as total_opex,
            SUM(energy_cost) as total_energy_cost
        ')->first();

        return [
            'avg_cost_per_m3' => round($stats->avg_cost_per_m3 ?? 0, 2),
            'min_cost_per_m3' => round($stats->min_cost_per_m3 ?? 0, 2),
            'max_cost_per_m3' => round($stats->max_cost_per_m3 ?? 0, 2),
            'avg_margin_per_m3' => round($stats->avg_margin_per_m3 ?? 0, 2),
            'total_production_m3' => round($stats->total_production_m3 ?? 0, 2),
            'total_billed_m3' => round($stats->total_billed_m3 ?? 0, 2),
            'total_opex' => round($stats->total_opex ?? 0, 2),
            'total_energy_cost' => round($stats->total_energy_cost ?? 0, 2),
            'nrw_percentage' => $stats->total_production_m3 > 0
                ? round((($stats->total_production_m3 - $stats->total_billed_m3) / $stats->total_production_m3) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get DMA league table (ranking DMAs by cost efficiency)
     */
    public function getDmaLeagueTable(string $period): array
    {
        return CostToServe::where('period', $period)
            ->whereNotNull('dma_id')
            ->orderBy('cost_per_m3', 'asc')
            ->select([
                'dma_id',
                'cost_per_m3',
                'margin_per_m3',
                'production_m3',
                'billed_m3',
                'opex_cost',
            ])
            ->get()
            ->map(function ($item, $index) {
                return [
                    'rank' => $index + 1,
                    'dma_id' => $item->dma_id,
                    'cost_per_m3' => $item->cost_per_m3,
                    'margin_per_m3' => $item->margin_per_m3,
                    'production_m3' => $item->production_m3,
                    'billed_m3' => $item->billed_m3,
                    'nrw_percentage' => $item->production_m3 > 0
                        ? round((($item->production_m3 - $item->billed_m3) / $item->production_m3) * 100, 2)
                        : 0,
                ];
            })
            ->toArray();
    }

    /**
     * Get trend data for charting
     */
    public function getTrendData(array $filters = []): array
    {
        $query = CostToServe::query();

        if (!empty($filters['period_from']) && !empty($filters['period_to'])) {
            $query->whereBetween('period', [$filters['period_from'], $filters['period_to']]);
        }

        if (!empty($filters['scheme_id'])) {
            $query->where('scheme_id', $filters['scheme_id']);
        }

        if (!empty($filters['dma_id'])) {
            $query->where('dma_id', $filters['dma_id']);
        }

        return $query
            ->selectRaw('
                period,
                AVG(cost_per_m3) as avg_cost_per_m3,
                AVG(revenue_per_m3) as avg_revenue_per_m3,
                AVG(margin_per_m3) as avg_margin_per_m3,
                SUM(production_m3) as total_production,
                SUM(billed_m3) as total_billed
            ')
            ->groupBy('period')
            ->orderBy('period', 'asc')
            ->get()
            ->toArray();
    }
}
