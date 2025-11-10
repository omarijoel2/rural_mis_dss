<?php

namespace App\Services\Projects;

use App\Models\Projects\InvestmentPipeline;
use App\Models\Projects\PipelineScore;
use App\Models\Projects\InvestmentAppraisal;
use App\Models\Projects\PortfolioScenario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvestmentService
{
    /**
     * Get all investment pipelines with optional filters
     */
    public function getAllPipelines(array $filters = [])
    {
        $query = InvestmentPipeline::with(['program', 'category', 'creator', 'approver']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['min_bcr'])) {
            $query->where('bcr', '>=', $filters['min_bcr']);
        }

        return $query->orderBy('priority_score', 'desc')->get();
    }

    /**
     * Get a single pipeline with scores and appraisals
     */
    public function getPipeline(string $id, bool $withDetails = true)
    {
        $query = InvestmentPipeline::with(['program', 'category', 'creator', 'approver']);

        if ($withDetails) {
            $query->with(['scores.criterion', 'appraisals.appraiser']);
        }

        return $query->findOrFail($id);
    }

    /**
     * Get pipeline details (alias for getPipeline with details)
     */
    public function getPipelineDetails(string $id)
    {
        return $this->getPipeline($id, true);
    }

    /**
     * Create a new investment pipeline
     */
    public function createPipeline(array $data): InvestmentPipeline
    {
        DB::beginTransaction();
        try {
            $pipeline = InvestmentPipeline::create([
                'tenant_id' => auth()->user()->tenant_id,
                'code' => $data['code'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'program_id' => $data['program_id'] ?? null,
                'category_id' => $data['category_id'],
                'estimated_cost' => $data['estimated_cost'],
                'currency' => $data['currency'] ?? 'KES',
                'connections_added' => $data['connections_added'] ?? null,
                'energy_savings' => $data['energy_savings'] ?? null,
                'nrw_reduction' => $data['nrw_reduction'] ?? null,
                'revenue_increase' => $data['revenue_increase'] ?? null,
                'status' => $data['status'] ?? 'active',
                'location' => $data['location'] ?? null,
                'created_by' => auth()->id(),
                'meta' => $data['meta'] ?? null,
            ]);

            DB::commit();
            Log::info('Investment pipeline created', ['pipeline_id' => $pipeline->id]);

            return $pipeline->load(['program', 'category']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create investment pipeline', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Update an existing pipeline
     */
    public function updatePipeline(string $id, array $data): InvestmentPipeline
    {
        $pipeline = InvestmentPipeline::findOrFail($id);

        // Don't allow editing approved pipelines
        if ($pipeline->status === 'approved') {
            throw new \Exception('Cannot modify an approved pipeline.');
        }

        $pipeline->update(array_filter($data, fn($value) => $value !== null));

        Log::info('Investment pipeline updated', ['pipeline_id' => $pipeline->id]);

        return $pipeline->fresh(['program', 'category', 'scores']);
    }

    /**
     * Delete a pipeline
     */
    public function deletePipeline(string $id): void
    {
        $pipeline = InvestmentPipeline::findOrFail($id);

        if (!in_array($pipeline->status, ['active', 'rejected'])) {
            throw new \Exception('Only active or rejected pipelines can be deleted.');
        }

        $pipeline->delete();
        Log::info('Investment pipeline deleted', ['pipeline_id' => $id]);
    }

    /**
     * Add or update a scoring criterion for a pipeline
     */
    public function addScore(string $pipelineId, array $data): PipelineScore
    {
        $pipeline = InvestmentPipeline::findOrFail($pipelineId);

        $score = PipelineScore::updateOrCreate(
            [
                'pipeline_id' => $pipeline->id,
                'criterion_id' => $data['criterion_id'],
            ],
            [
                'raw_score' => $data['raw_score'],
                'weighted_score' => $data['weighted_score'],
                'rationale' => $data['rationale'] ?? null,
                'scored_by' => auth()->id(),
            ]
        );

        // Recalculate total priority score
        $this->recalculatePriorityScore($pipeline->id);

        Log::info('Pipeline score added/updated', ['pipeline_id' => $pipeline->id, 'criterion_id' => $data['criterion_id']]);

        return $score;
    }

    /**
     * Score a pipeline (wrapper for addScore)
     */
    public function scorePipeline(string $pipelineId, string $criterionId, float $rawScore, float $weightedScore, ?string $rationale = null): PipelineScore
    {
        return $this->addScore($pipelineId, [
            'criterion_id' => $criterionId,
            'raw_score' => $rawScore,
            'weighted_score' => $weightedScore,
            'rationale' => $rationale,
        ]);
    }

    /**
     * Get all scores for a pipeline
     */
    public function getPipelineScores(string $pipelineId)
    {
        $pipeline = InvestmentPipeline::findOrFail($pipelineId);
        return $pipeline->scores()->with('criterion')->get();
    }

    /**
     * Recalculate the priority score for a pipeline
     */
    public function recalculatePriorityScore(string $pipelineId): void
    {
        $pipeline = InvestmentPipeline::findOrFail($pipelineId);
        $totalWeightedScore = $pipeline->scores()->sum('weighted_score');

        $pipeline->update(['priority_score' => $totalWeightedScore]);
    }

    /**
     * Create an investment appraisal with NPV/BCR calculations
     */
    public function createAppraisal(string $pipelineId, array $data): InvestmentAppraisal
    {
        $pipeline = InvestmentPipeline::findOrFail($pipelineId);

        // Calculate NPV, BCR, and IRR
        $calculations = $this->calculateFinancialMetrics(
            $data['capex'],
            $data['opex_annual'] ?? 0,
            $data['cash_flows'] ?? [],
            $data['project_life_years'] ?? 20,
            $data['discount_rate'] ?? 0.08
        );

        $appraisal = InvestmentAppraisal::create([
            'pipeline_id' => $pipeline->id,
            'appraisal_no' => $data['appraisal_no'],
            'appraiser_id' => auth()->id(),
            'appraisal_date' => $data['appraisal_date'] ?? now(),
            'executive_summary' => $data['executive_summary'] ?? null,
            'capex' => $data['capex'],
            'opex_annual' => $data['opex_annual'] ?? 0,
            'project_life_years' => $data['project_life_years'] ?? 20,
            'discount_rate' => $data['discount_rate'] ?? 0.08,
            'calculated_npv' => $calculations['npv'],
            'calculated_bcr' => $calculations['bcr'],
            'calculated_irr' => $calculations['irr'],
            'risks' => $data['risks'] ?? null,
            'assumptions' => $data['assumptions'] ?? null,
            'recommendation' => $data['recommendation'] ?? null,
            'recommendation_notes' => $data['recommendation_notes'] ?? null,
            'cash_flows' => $data['cash_flows'] ?? [],
            'meta' => $data['meta'] ?? null,
        ]);

        // Update pipeline with calculated metrics
        $pipeline->update([
            'bcr' => $calculations['bcr'],
            'npv' => $calculations['npv'],
            'irr' => $calculations['irr'],
            'status' => 'shortlisted',
        ]);

        Log::info('Investment appraisal created', [
            'pipeline_id' => $pipeline->id,
            'appraisal_id' => $appraisal->id,
            'npv' => $calculations['npv'],
            'bcr' => $calculations['bcr'],
        ]);

        return $appraisal;
    }

    /**
     * Calculate NPV, BCR, and IRR
     */
    private function calculateFinancialMetrics(
        float $capex,
        float $opexAnnual,
        array $cashFlows,
        int $projectLifeYears,
        float $discountRate
    ): array {
        // If no cash flows provided, generate simple ones
        if (empty($cashFlows)) {
            $cashFlows = [];
            for ($year = 0; $year <= $projectLifeYears; $year++) {
                $cashFlows[] = [
                    'year' => $year,
                    'cost' => $year === 0 ? $capex : $opexAnnual,
                    'benefit' => $year > 0 ? ($capex * 0.15) : 0, // Assume 15% annual benefit
                ];
            }
        }

        // Calculate NPV
        $npv = 0;
        $totalPVCosts = 0;
        $totalPVBenefits = 0;

        foreach ($cashFlows as $flow) {
            $year = $flow['year'];
            $cost = $flow['cost'] ?? 0;
            $benefit = $flow['benefit'] ?? 0;
            $discountFactor = pow(1 + $discountRate, -$year);

            $pvCost = $cost * $discountFactor;
            $pvBenefit = $benefit * $discountFactor;

            $totalPVCosts += $pvCost;
            $totalPVBenefits += $pvBenefit;
        }

        $npv = $totalPVBenefits - $totalPVCosts;

        // Calculate BCR (Benefit-Cost Ratio)
        $bcr = $totalPVCosts > 0 ? ($totalPVBenefits / $totalPVCosts) : 0;

        // Calculate IRR (simplified - using bisection method approximation)
        $irr = $this->calculateIRR($cashFlows);

        return [
            'npv' => round($npv, 2),
            'bcr' => round($bcr, 4),
            'irr' => round($irr, 4),
        ];
    }

    /**
     * Calculate Internal Rate of Return (IRR) using bisection method
     */
    private function calculateIRR(array $cashFlows, int $maxIterations = 100): float
    {
        $lowRate = -0.5;
        $highRate = 1.0;
        $tolerance = 0.0001;

        for ($i = 0; $i < $maxIterations; $i++) {
            $midRate = ($lowRate + $highRate) / 2;
            $npvAtMid = 0;

            foreach ($cashFlows as $flow) {
                $year = $flow['year'];
                $netCashFlow = ($flow['benefit'] ?? 0) - ($flow['cost'] ?? 0);
                $npvAtMid += $netCashFlow / pow(1 + $midRate, $year);
            }

            if (abs($npvAtMid) < $tolerance) {
                return $midRate;
            }

            if ($npvAtMid > 0) {
                $lowRate = $midRate;
            } else {
                $highRate = $midRate;
            }
        }

        return ($lowRate + $highRate) / 2;
    }

    /**
     * Get all appraisals for a pipeline
     */
    public function getPipelineAppraisals(string $pipelineId)
    {
        $pipeline = InvestmentPipeline::findOrFail($pipelineId);
        return $pipeline->appraisals()->with('appraiser')->get();
    }

    /**
     * Approve an appraisal and mark pipeline as approved
     */
    public function approveAppraisal(string $appraisalId): InvestmentAppraisal
    {
        $appraisal = InvestmentAppraisal::findOrFail($appraisalId);

        if ($appraisal->recommendation !== 'approve') {
            throw new \Exception('Only appraisals with "approve" recommendation can be approved.');
        }

        $appraisal->update([
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Update pipeline status
        $appraisal->pipeline->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        Log::info('Investment appraisal approved', ['appraisal_id' => $appraisal->id]);

        return $appraisal;
    }

    /**
     * Convert a pipeline to a project
     */
    public function convertToProject(string $pipelineId)
    {
        $pipeline = InvestmentPipeline::findOrFail($pipelineId);

        if ($pipeline->status !== 'approved') {
            throw new \Exception('Only approved pipelines can be converted to projects.');
        }

        DB::beginTransaction();
        try {
            $pipeline->update([
                'status' => 'converted',
            ]);

            Log::info('Pipeline converted to project', ['pipeline_id' => $pipelineId]);

            DB::commit();
            return $pipeline->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to convert pipeline to project', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Create a portfolio optimization scenario
     */
    public function createPortfolioScenario(array $data): PortfolioScenario
    {
        // Get all approved pipelines
        $pipelines = InvestmentPipeline::where('status', 'approved')
            ->orderBy('bcr', 'desc')
            ->get();

        $budgetConstraint = $data['budget_constraint'];
        $selectedPipelines = [];
        $totalCost = 0;
        $totalNPV = 0;

        // Simple greedy optimization by BCR
        foreach ($pipelines as $pipeline) {
            if ($totalCost + $pipeline->estimated_cost <= $budgetConstraint) {
                $selectedPipelines[] = $pipeline->id;
                $totalCost += $pipeline->estimated_cost;
                $totalNPV += $pipeline->npv ?? 0;
            }
        }

        $scenario = PortfolioScenario::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $data['name'],
            'budget_constraint' => $budgetConstraint,
            'optimization_method' => $data['optimization_method'] ?? 'max_bcr',
            'selected_pipelines' => $selectedPipelines,
            'total_cost' => $totalCost,
            'total_npv' => $totalNPV,
            'created_by' => auth()->id(),
        ]);

        Log::info('Portfolio scenario created', [
            'scenario_id' => $scenario->id,
            'selected_count' => count($selectedPipelines),
        ]);

        return $scenario;
    }

    /**
     * Get dashboard statistics for investment planning
     */
    public function getDashboardStats(): array
    {
        $pipelines = InvestmentPipeline::all();

        return [
            'total_pipelines' => $pipelines->count(),
            'active_count' => $pipelines->where('status', 'active')->count(),
            'shortlisted_count' => $pipelines->where('status', 'shortlisted')->count(),
            'approved_count' => $pipelines->where('status', 'approved')->count(),
            'rejected_count' => $pipelines->where('status', 'rejected')->count(),
            'converted_count' => $pipelines->where('status', 'converted')->count(),
            'total_estimated_cost' => $pipelines->sum('estimated_cost'),
            'average_bcr' => round($pipelines->avg('bcr'), 2),
            'average_npv' => round($pipelines->avg('npv'), 2),
            'total_connections_planned' => $pipelines->sum('connections_added'),
        ];
    }
}
