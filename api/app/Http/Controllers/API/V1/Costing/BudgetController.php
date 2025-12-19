<?php

namespace App\Http\Controllers\Api\V1\Costing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Costing\StoreBudgetVersionRequest;
use App\Http\Requests\Costing\UpdateBudgetVersionRequest;
use App\Http\Requests\Costing\UpsertBudgetLinesRequest;
use App\Services\Costing\BudgetService;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    private BudgetService $budgetService;

    public function __construct(BudgetService $budgetService)
    {
        $this->budgetService = $budgetService;
    }

    /**
     * GET /api/v1/costing/budgets
     * List all budget versions
     */
    public function index(Request $request)
    {

        $filters = $request->only(['fiscal_year', 'status']);
        $versions = $this->budgetService->getAllVersions($filters);

        return response()->json([
            'data' => $versions,
            'meta' => [
                'total' => $versions->count(),
            ],
        ]);
    }

    /**
     * GET /api/v1/costing/budgets/{id}
     * Get a single budget version
     */
    public function show(string $id, Request $request)
    {

        $includeLines = filter_var(
            $request->query('include_lines', true),
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        ) !== false;

        $version = $this->budgetService->getVersion($id, $includeLines);

        return response()->json([
            'data' => $version,
        ]);
    }

    /**
     * POST /api/v1/costing/budgets
     * Create a new budget version
     */
    public function store(StoreBudgetVersionRequest $request)
    {

        $version = $this->budgetService->createVersion($request->validated());

        return response()->json([
            'data' => $version,
            'message' => 'Budget version created successfully.',
        ], 201);
    }

    /**
     * PATCH /api/v1/costing/budgets/{id}
     * Update a budget version
     */
    public function update(string $id, UpdateBudgetVersionRequest $request)
    {

        $version = $this->budgetService->updateVersion($id, $request->validated());

        return response()->json([
            'data' => $version,
            'message' => 'Budget version updated successfully.',
        ]);
    }

    /**
     * DELETE /api/v1/costing/budgets/{id}
     * Delete a budget version
     */
    public function destroy(string $id)
    {

        $this->budgetService->deleteVersion($id);

        return response()->noContent();
    }

    /**
     * POST /api/v1/costing/budgets/{id}/approve
     * Approve a budget version
     */
    public function approve(string $id)
    {

        $version = $this->budgetService->approveVersion($id);

        return response()->json([
            'data' => $version,
            'message' => 'Budget version approved successfully.',
        ]);
    }

    /**
     * GET /api/v1/costing/budgets/{id}/lines
     * Get budget lines for a version
     */
    public function getLines(string $id, Request $request)
    {

        $filters = $request->only(['cost_center_id', 'gl_account_id', 'period_from', 'period_to']);
        $lines = $this->budgetService->getLines($id, $filters);

        return response()->json([
            'data' => $lines,
            'meta' => [
                'total' => $lines->count(),
            ],
        ]);
    }

    /**
     * POST /api/v1/costing/budgets/{id}/lines
     * Bulk upsert budget lines
     */
    public function upsertLines(string $id, UpsertBudgetLinesRequest $request)
    {

        $this->budgetService->upsertLines($id, $request->validated()['lines']);

        return response()->json([
            'message' => 'Budget lines saved successfully.',
        ]);
    }

    /**
     * GET /api/v1/costing/budgets/{id}/summary
     * Get budget summary by cost center
     */
    public function getSummary(string $id)
    {

        $summary = $this->budgetService->getSummaryByCostCenter($id);

        return response()->json([
            'data' => $summary,
        ]);
    }
}
