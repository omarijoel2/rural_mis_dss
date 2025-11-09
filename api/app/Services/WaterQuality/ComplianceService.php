<?php

namespace App\Services\WaterQuality;

use App\Models\WqCompliance;
use App\Models\WqSamplingPoint;
use App\Models\WqParameter;
use App\Models\WqResult;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComplianceService
{
    /**
     * Compute compliance for a sampling point and parameter over a period.
     */
    public function computeCompliance(
        int $samplingPointId,
        int $parameterId,
        string $period,
        string $granularity,
        User $user
    ): WqCompliance {
        $tenantId = $user->currentTenantId();

        $samplingPoint = WqSamplingPoint::where('id', $samplingPointId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $parameter = WqParameter::findOrFail($parameterId);

        // Get results for this period
        $results = $this->getResultsForPeriod(
            $samplingPointId,
            $parameterId,
            $period,
            $granularity
        );

        // Calculate compliance metrics
        $totalSamples = $results->count();
        $compliantSamples = 0;
        $breaches = 0;
        $worstValue = null;

        // Determine which limit to use (prioritize local > WASREB > WHO)
        $limit = $parameter->local_limit 
            ?? $parameter->wasreb_limit 
            ?? $parameter->who_limit;

        foreach ($results as $result) {
            if ($result->value === null) {
                continue;
            }

            // Track worst value
            if ($worstValue === null || $result->value > $worstValue) {
                $worstValue = $result->value;
            }

            // Check compliance
            if ($limit !== null) {
                if ($result->value <= $limit) {
                    $compliantSamples++;
                } else {
                    $breaches++;
                }
            } else {
                // No limit defined - assume compliant
                $compliantSamples++;
            }
        }

        $compliancePct = $totalSamples > 0 
            ? ($compliantSamples / $totalSamples) * 100 
            : 0;

        // Update or create compliance record
        return WqCompliance::updateOrCreate(
            [
                'sampling_point_id' => $samplingPointId,
                'parameter_id' => $parameterId,
                'period' => $period,
                'granularity' => $granularity,
            ],
            [
                'samples_taken' => $totalSamples,
                'samples_compliant' => $compliantSamples,
                'compliance_pct' => round($compliancePct, 2),
                'worst_value' => $worstValue,
                'breaches' => $breaches,
            ]
        );
    }

    /**
     * Get results for a specific period and granularity.
     */
    protected function getResultsForPeriod(
        int $samplingPointId,
        int $parameterId,
        string $period,
        string $granularity
    ) {
        $periodDate = Carbon::parse($period);
        
        // Calculate date range based on granularity
        [$startDate, $endDate] = match($granularity) {
            'week' => [
                $periodDate->startOfWeek(),
                $periodDate->copy()->endOfWeek()
            ],
            'month' => [
                $periodDate->startOfMonth(),
                $periodDate->copy()->endOfMonth()
            ],
            'quarter' => [
                $periodDate->startOfQuarter(),
                $periodDate->copy()->endOfQuarter()
            ],
            default => [
                $periodDate->copy(),
                $periodDate->copy()->addDay()
            ],
        };

        return WqResult::whereHas('sampleParam', function ($q) use ($samplingPointId, $parameterId) {
                $q->where('parameter_id', $parameterId)
                    ->whereHas('sample', function ($sq) use ($samplingPointId) {
                        $sq->where('sampling_point_id', $samplingPointId);
                    });
            })
            ->whereBetween('analyzed_at', [$startDate, $endDate])
            ->with('sampleParam.parameter')
            ->get();
    }

    /**
     * Compute compliance for all sampling points and parameters for a period.
     * This is typically run as a scheduled job.
     */
    public function computeAllCompliance(string $period, string $granularity, User $user): array
    {
        $tenantId = $user->currentTenantId();
        $computed = [];

        $samplingPoints = WqSamplingPoint::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->get();

        $parameters = WqParameter::where('is_active', true)->get();

        foreach ($samplingPoints as $point) {
            foreach ($parameters as $param) {
                try {
                    $compliance = $this->computeCompliance(
                        $point->id,
                        $param->id,
                        $period,
                        $granularity,
                        $user
                    );

                    if ($compliance->samples_taken > 0) {
                        $computed[] = $compliance;
                    }
                } catch (\Exception $e) {
                    // Skip if no data for this combination
                    continue;
                }
            }
        }

        return $computed;
    }

    /**
     * Get compliance summary/dashboard data.
     */
    public function getComplianceSummary(User $user, array $filters = []): array
    {
        $tenantId = $user->currentTenantId();

        $query = WqCompliance::whereHas('samplingPoint', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        });

        if (!empty($filters['granularity'])) {
            $query->where('granularity', $filters['granularity']);
        }

        if (!empty($filters['period_from'])) {
            $query->where('period', '>=', $filters['period_from']);
        }

        if (!empty($filters['period_to'])) {
            $query->where('period', '<=', $filters['period_to']);
        }

        $records = $query->with(['samplingPoint', 'parameter'])->get();

        // Calculate summary statistics
        $totalSamples = $records->sum('samples_taken');
        $totalBreaches = $records->sum('breaches');
        $avgCompliance = $records->avg('compliance_pct') ?? 0;

        // Identify worst performing points
        $worstPoints = $records
            ->sortBy('compliance_pct')
            ->take(5)
            ->values();

        // Identify most frequently breached parameters
        $breachedParams = $records
            ->filter(fn($r) => $r->breaches > 0)
            ->groupBy('parameter_id')
            ->map(fn($group) => [
                'parameter' => $group->first()->parameter,
                'total_breaches' => $group->sum('breaches'),
                'points_affected' => $group->count(),
            ])
            ->sortByDesc('total_breaches')
            ->take(5)
            ->values();

        return [
            'overview' => [
                'total_samples' => $totalSamples,
                'total_breaches' => $totalBreaches,
                'average_compliance_pct' => round($avgCompliance, 2),
                'compliance_grade' => $this->getComplianceGrade($avgCompliance),
            ],
            'worst_performing_points' => $worstPoints,
            'most_breached_parameters' => $breachedParams,
            'trend_data' => $this->getTrendData($records),
        ];
    }

    /**
     * Get compliance grade based on percentage.
     */
    protected function getComplianceGrade(float $pct): string
    {
        if ($pct >= 95) return 'Excellent';
        if ($pct >= 85) return 'Good';
        if ($pct >= 70) return 'Fair';
        if ($pct >= 50) return 'Poor';
        return 'Critical';
    }

    /**
     * Get trend data for charting.
     */
    protected function getTrendData($records): array
    {
        return $records
            ->groupBy('period')
            ->map(fn($group) => [
                'period' => $group->first()->period,
                'compliance_pct' => round($group->avg('compliance_pct'), 2),
                'samples_taken' => $group->sum('samples_taken'),
                'breaches' => $group->sum('breaches'),
            ])
            ->sortBy('period')
            ->values()
            ->toArray();
    }

    /**
     * List compliance records with filters.
     */
    public function listCompliance(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        // Ensure tenant scoping
        $query = WqCompliance::whereHas('samplingPoint', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })
            ->with(['samplingPoint', 'parameter']);

        if (!empty($filters['sampling_point_id'])) {
            $query->where('sampling_point_id', $filters['sampling_point_id']);
        }

        if (!empty($filters['parameter_id'])) {
            $query->where('parameter_id', $filters['parameter_id']);
        }

        if (!empty($filters['granularity'])) {
            $query->where('granularity', $filters['granularity']);
        }

        if (!empty($filters['has_breaches'])) {
            $query->where('breaches', '>', 0);
        }

        return $query->orderBy('period', 'desc')->paginate($perPage);
    }
}
