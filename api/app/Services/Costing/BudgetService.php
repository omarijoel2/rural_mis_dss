<?php

namespace App\Services\Costing;

use App\Models\Costing\BudgetVersion;
use App\Models\Costing\BudgetLine;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BudgetService
{
    /**
     * Get all budget versions for the current tenant
     */
    public function getAllVersions(array $filters = [])
    {
        $query = BudgetVersion::with(['creator', 'approver', 'baseVersion']);

        if (!empty($filters['fiscal_year'])) {
            $query->where('fiscal_year', $filters['fiscal_year']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get a single budget version with its lines
     */
    public function getVersion(string $id, bool $includeLines = true)
    {
        $query = BudgetVersion::with(['creator', 'approver', 'baseVersion']);

        if ($includeLines) {
            $query->with(['lines.costCenter', 'lines.glAccount']);
        }

        return $query->findOrFail($id);
    }

    /**
     * Create a new budget version
     */
    public function createVersion(array $data): BudgetVersion
    {
        DB::beginTransaction();
        try {
            $version = BudgetVersion::create([
                'tenant_id' => auth()->user()->tenant_id,
                'name' => $data['name'],
                'fiscal_year' => $data['fiscal_year'],
                'status' => $data['status'] ?? 'draft',
                'is_rolling' => $data['is_rolling'] ?? false,
                'base_version_id' => $data['base_version_id'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // If copying from base version, copy lines
            if (!empty($data['base_version_id'])) {
                $this->copyLinesFromBase($version, $data['base_version_id']);
            }

            DB::commit();
            Log::info('Budget version created', ['version_id' => $version->id, 'user_id' => auth()->id()]);

            return $version->load(['creator', 'lines']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create budget version', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Update an existing budget version
     */
    public function updateVersion(string $id, array $data): BudgetVersion
    {
        $version = BudgetVersion::findOrFail($id);

        // Don't allow editing approved budgets
        if ($version->status === 'approved') {
            throw new \Exception('Cannot modify an approved budget. Create a new revision instead.');
        }

        $version->update([
            'name' => $data['name'] ?? $version->name,
            'fiscal_year' => $data['fiscal_year'] ?? $version->fiscal_year,
            'status' => $data['status'] ?? $version->status,
            'is_rolling' => $data['is_rolling'] ?? $version->is_rolling,
        ]);

        Log::info('Budget version updated', ['version_id' => $version->id, 'user_id' => auth()->id()]);

        return $version->fresh(['creator', 'approver', 'lines']);
    }

    /**
     * Delete a budget version (only drafts can be deleted)
     */
    public function deleteVersion(string $id): void
    {
        $version = BudgetVersion::findOrFail($id);

        if ($version->status !== 'draft') {
            throw new \Exception('Only draft budgets can be deleted.');
        }

        DB::beginTransaction();
        try {
            // Delete all budget lines first
            $version->lines()->delete();
            $version->delete();

            DB::commit();
            Log::info('Budget version deleted', ['version_id' => $id, 'user_id' => auth()->id()]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete budget version', ['version_id' => $id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Approve a budget version
     */
    public function approveVersion(string $id): BudgetVersion
    {
        $version = BudgetVersion::findOrFail($id);

        if ($version->status === 'approved') {
            throw new \Exception('Budget is already approved.');
        }

        $version->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        Log::info('Budget version approved', ['version_id' => $id, 'user_id' => auth()->id()]);

        return $version->fresh(['creator', 'approver']);
    }

    /**
     * Get budget lines for a version
     */
    public function getLines(string $versionId, array $filters = [])
    {
        $query = BudgetLine::where('version_id', $versionId)
            ->with(['costCenter', 'glAccount']);

        if (!empty($filters['cost_center_id'])) {
            $query->where('cost_center_id', $filters['cost_center_id']);
        }

        if (!empty($filters['gl_account_id'])) {
            $query->where('gl_account_id', $filters['gl_account_id']);
        }

        if (!empty($filters['period_from']) && !empty($filters['period_to'])) {
            $query->whereBetween('period', [$filters['period_from'], $filters['period_to']]);
        }

        return $query->orderBy('period')->orderBy('cost_center_id')->get();
    }

    /**
     * Bulk upsert budget lines
     */
    public function upsertLines(string $versionId, array $lines): void
    {
        $version = BudgetVersion::findOrFail($versionId);

        if ($version->status === 'approved') {
            throw new \Exception('Cannot modify lines in an approved budget.');
        }

        DB::beginTransaction();
        try {
            foreach ($lines as $lineData) {
                BudgetLine::updateOrCreate(
                    [
                        'version_id' => $versionId,
                        'cost_center_id' => $lineData['cost_center_id'],
                        'gl_account_id' => $lineData['gl_account_id'],
                        'period' => $lineData['period'],
                    ],
                    [
                        'amount' => $lineData['amount'],
                        'class' => $lineData['class'] ?? null,
                        'scheme_id' => $lineData['scheme_id'] ?? null,
                        'dma_id' => $lineData['dma_id'] ?? null,
                        'project_id' => $lineData['project_id'] ?? null,
                        'meta' => $lineData['meta'] ?? null,
                    ]
                );
            }

            DB::commit();
            Log::info('Budget lines upserted', ['version_id' => $versionId, 'count' => count($lines)]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to upsert budget lines', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Copy budget lines from a base version
     */
    private function copyLinesFromBase(BudgetVersion $newVersion, string $baseVersionId): void
    {
        $baseLines = BudgetLine::where('version_id', $baseVersionId)->get();

        foreach ($baseLines as $baseLine) {
            BudgetLine::create([
                'version_id' => $newVersion->id,
                'cost_center_id' => $baseLine->cost_center_id,
                'gl_account_id' => $baseLine->gl_account_id,
                'period' => $baseLine->period,
                'amount' => $baseLine->amount,
                'class' => $baseLine->class,
                'scheme_id' => $baseLine->scheme_id,
                'dma_id' => $baseLine->dma_id,
                'project_id' => $baseLine->project_id,
                'meta' => $baseLine->meta,
            ]);
        }

        Log::info('Budget lines copied from base version', [
            'new_version_id' => $newVersion->id,
            'base_version_id' => $baseVersionId,
            'lines_count' => $baseLines->count()
        ]);
    }

    /**
     * Get budget summary by cost center
     */
    public function getSummaryByCostCenter(string $versionId)
    {
        return BudgetLine::where('version_id', $versionId)
            ->join('cost_centers', 'budget_lines.cost_center_id', '=', 'cost_centers.id')
            ->selectRaw('
                cost_centers.id,
                cost_centers.code,
                cost_centers.name,
                SUM(budget_lines.amount) as total_amount,
                COUNT(DISTINCT budget_lines.gl_account_id) as account_count
            ')
            ->groupBy('cost_centers.id', 'cost_centers.code', 'cost_centers.name')
            ->get();
    }
}
