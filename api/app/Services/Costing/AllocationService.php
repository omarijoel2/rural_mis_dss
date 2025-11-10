<?php

namespace App\Services\Costing;

use App\Models\Costing\AllocationRule;
use App\Models\Costing\AllocRun;
use App\Models\Costing\AllocResult;
use App\Models\Costing\DriverValue;
use App\Models\Costing\BudgetLine;
use App\Models\Costing\Actual;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AllocationService
{
    /**
     * Get all allocation rules
     */
    public function getAllRules(array $filters = [])
    {
        $query = AllocationRule::with('driver');

        if (isset($filters['active'])) {
            $query->where('active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Create a new allocation rule
     */
    public function createRule(array $data): AllocationRule
    {
        $rule = AllocationRule::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $data['name'],
            'basis' => $data['basis'],
            'driver_id' => $data['driver_id'] ?? null,
            'percentage' => $data['percentage'] ?? null,
            'formula' => $data['formula'] ?? null,
            'applies_to' => $data['applies_to'],
            'active' => $data['active'] ?? true,
            'scope_filter' => $data['scope_filter'] ?? null,
        ]);

        Log::info('Allocation rule created', ['rule_id' => $rule->id, 'user_id' => auth()->id()]);

        return $rule->load('driver');
    }

    /**
     * Update an allocation rule
     */
    public function updateRule(string $id, array $data): AllocationRule
    {
        $rule = AllocationRule::findOrFail($id);

        $rule->update([
            'name' => $data['name'] ?? $rule->name,
            'basis' => $data['basis'] ?? $rule->basis,
            'driver_id' => $data['driver_id'] ?? $rule->driver_id,
            'percentage' => $data['percentage'] ?? $rule->percentage,
            'formula' => $data['formula'] ?? $rule->formula,
            'applies_to' => $data['applies_to'] ?? $rule->applies_to,
            'active' => $data['active'] ?? $rule->active,
            'scope_filter' => $data['scope_filter'] ?? $rule->scope_filter,
        ]);

        Log::info('Allocation rule updated', ['rule_id' => $id, 'user_id' => auth()->id()]);

        return $rule->fresh('driver');
    }

    /**
     * Delete an allocation rule
     */
    public function deleteRule(string $id): void
    {
        $rule = AllocationRule::findOrFail($id);
        $rule->delete();

        Log::info('Allocation rule deleted', ['rule_id' => $id, 'user_id' => auth()->id()]);
    }

    /**
     * Get all allocation runs
     */
    public function getAllRuns(array $filters = [])
    {
        $query = AllocRun::with(['version', 'forecast']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['period_from'])) {
            $query->where('period_from', '>=', $filters['period_from']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get a single allocation run with results
     */
    public function getRun(string $id, bool $includeResults = true)
    {
        $query = AllocRun::with(['version', 'forecast']);

        if ($includeResults) {
            $query->with(['results.glAccount', 'results.costCenter']);
        }

        return $query->findOrFail($id);
    }

    /**
     * Execute an allocation run
     */
    public function executeRun(array $data): AllocRun
    {
        // Create the allocation run BEFORE transaction so it persists even if we rollback
        $run = AllocRun::create([
            'tenant_id' => auth()->user()->tenant_id,
            'version_id' => $data['version_id'] ?? null,
            'forecast_id' => $data['forecast_id'] ?? null,
            'period_from' => $data['period_from'],
            'period_to' => $data['period_to'],
            'status' => 'running',
            'started_at' => now(),
        ]);

        DB::beginTransaction();
        try {
            // Get active allocation rules
            $rules = AllocationRule::where('active', true)->with('driver')->get();

            if ($rules->isEmpty()) {
                throw new \Exception('No active allocation rules found.');
            }

            // Process allocations
            $this->processAllocations($run, $rules, $data);

            // Mark run as completed
            $run->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            DB::commit();
            Log::info('Allocation run completed', ['run_id' => $run->id, 'results_count' => $run->results()->count()]);

            return $run->load(['results.glAccount', 'results.costCenter']);
        } catch (\Exception $e) {
            DB::rollBack();

            // Mark run as failed - record persists because it was created outside the transaction
            $run->update([
                'status' => 'failed',
                'meta' => ['error' => $e->getMessage()],
            ]);

            Log::error('Allocation run failed', ['run_id' => $run->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Process allocations based on rules
     */
    private function processAllocations(AllocRun $run, $rules, array $data): void
    {
        $source = $data['version_id'] ? 'budget' : 'actual';
        $sourceId = $data['version_id'] ?? null;

        foreach ($rules as $rule) {
            // Get source data based on rule's applies_to
            $sourceData = $this->getSourceData($source, $sourceId, $data['period_from'], $data['period_to'], $rule);

            // Get driver values if driver-based
            $driverValues = null;
            if ($rule->basis === 'driver' && $rule->driver_id) {
                $driverValues = $this->getDriverValues($rule->driver_id, $data['period_from'], $data['period_to']);
            }

            // Allocate amounts
            $this->allocateAmounts($run, $rule, $sourceData, $driverValues);
        }
    }

    /**
     * Get source data (budget or actuals) to allocate
     */
    private function getSourceData(string $source, ?string $sourceId, string $periodFrom, string $periodTo, AllocationRule $rule)
    {
        if ($source === 'budget' && $sourceId) {
            return BudgetLine::where('version_id', $sourceId)
                ->whereBetween('period', [$periodFrom, $periodTo])
                ->where('class', $rule->applies_to)
                ->with(['glAccount', 'costCenter'])
                ->get();
        }

        return Actual::whereBetween('period', [$periodFrom, $periodTo])
            ->where('class', $rule->applies_to)
            ->with(['glAccount', 'costCenter'])
            ->get();
    }

    /**
     * Get driver values for the allocation period
     */
    private function getDriverValues(string $driverId, string $periodFrom, string $periodTo)
    {
        return DriverValue::where('driver_id', $driverId)
            ->whereBetween('period', [$periodFrom, $periodTo])
            ->get()
            ->keyBy(function ($item) {
                return $item->period->format('Y-m-d') . '_' . ($item->scope_id ?? 'global');
            });
    }

    /**
     * Allocate amounts based on rule and driver values
     */
    private function allocateAmounts(AllocRun $run, AllocationRule $rule, $sourceData, $driverValues): void
    {
        foreach ($sourceData as $line) {
            $allocatedAmount = 0;

            if ($rule->basis === 'percentage') {
                $allocatedAmount = $line->amount * ($rule->percentage / 100);
            } elseif ($rule->basis === 'driver' && $driverValues) {
                $key = $line->period->format('Y-m-d') . '_' . ($line->dma_id ?? 'global');
                $driverValue = $driverValues[$key] ?? null;

                if ($driverValue && $driverValue->value > 0) {
                    $allocatedAmount = $line->amount * $driverValue->value;
                }
            } elseif ($rule->basis === 'equal') {
                // For equal split, would need to know the number of targets
                $allocatedAmount = $line->amount;
            }

            // Create allocation result
            AllocResult::create([
                'run_id' => $run->id,
                'gl_account_id' => $line->gl_account_id,
                'cost_center_id' => $line->cost_center_id,
                'scheme_id' => $line->scheme_id ?? null,
                'dma_id' => $line->dma_id ?? null,
                'class' => $rule->applies_to,
                'period' => $line->period,
                'amount' => $allocatedAmount,
                'driver_value' => $driverValues ? ($driverValues[$line->period->format('Y-m-d') . '_' . ($line->dma_id ?? 'global')]->value ?? null) : null,
            ]);
        }
    }

    /**
     * Delete an allocation run and its results
     */
    public function deleteRun(string $id): void
    {
        $run = AllocRun::findOrFail($id);

        DB::beginTransaction();
        try {
            $run->results()->delete();
            $run->delete();

            DB::commit();
            Log::info('Allocation run deleted', ['run_id' => $id, 'user_id' => auth()->id()]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete allocation run', ['run_id' => $id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
