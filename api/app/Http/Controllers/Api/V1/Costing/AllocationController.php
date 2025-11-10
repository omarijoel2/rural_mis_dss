<?php

namespace App\Http\Controllers\Api\V1\Costing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Costing\StoreAllocationRuleRequest;
use App\Http\Requests\Costing\UpdateAllocationRuleRequest;
use App\Http\Requests\Costing\ExecuteAllocationRequest;
use App\Services\Costing\AllocationService;
use Illuminate\Http\Request;

class AllocationController extends Controller
{
    private AllocationService $allocationService;

    public function __construct(AllocationService $allocationService)
    {
        $this->allocationService = $allocationService;
    }

    /**
     * GET /api/v1/costing/allocation-rules
     * List all allocation rules
     */
    public function indexRules(Request $request)
    {

        $filters = [];
        if ($request->has('active')) {
            $filters['active'] = $request->query('active');
        }

        $rules = $this->allocationService->getAllRules($filters);

        return response()->json([
            'data' => $rules,
            'meta' => [
                'total' => $rules->count(),
            ],
        ]);
    }

    /**
     * POST /api/v1/costing/allocation-rules
     * Create a new allocation rule
     */
    public function storeRule(StoreAllocationRuleRequest $request)
    {

        $rule = $this->allocationService->createRule($request->validated());

        return response()->json([
            'data' => $rule,
            'message' => 'Allocation rule created successfully.',
        ], 201);
    }

    /**
     * PATCH /api/v1/costing/allocation-rules/{id}
     * Update an allocation rule
     */
    public function updateRule(string $id, UpdateAllocationRuleRequest $request)
    {

        $rule = $this->allocationService->updateRule($id, $request->validated());

        return response()->json([
            'data' => $rule,
            'message' => 'Allocation rule updated successfully.',
        ]);
    }

    /**
     * DELETE /api/v1/costing/allocation-rules/{id}
     * Delete an allocation rule
     */
    public function destroyRule(string $id)
    {

        $this->allocationService->deleteRule($id);

        return response()->noContent();
    }

    /**
     * GET /api/v1/costing/allocation-runs
     * List all allocation runs
     */
    public function indexRuns(Request $request)
    {

        $filters = $request->only(['status', 'period_from']);
        $runs = $this->allocationService->getAllRuns($filters);

        return response()->json([
            'data' => $runs,
            'meta' => [
                'total' => $runs->count(),
            ],
        ]);
    }

    /**
     * GET /api/v1/costing/allocation-runs/{id}
     * Get a single allocation run with results
     */
    public function showRun(string $id, Request $request)
    {

        $includeResults = filter_var(
            $request->query('include_results', true),
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        ) !== false;

        $run = $this->allocationService->getRun($id, $includeResults);

        return response()->json([
            'data' => $run,
        ]);
    }

    /**
     * POST /api/v1/costing/allocation-runs
     * Execute a new allocation run
     */
    public function executeRun(ExecuteAllocationRequest $request)
    {

        $run = $this->allocationService->executeRun($request->validated());

        return response()->json([
            'data' => $run,
            'message' => 'Allocation run completed successfully.',
        ], 201);
    }

    /**
     * DELETE /api/v1/costing/allocation-runs/{id}
     * Delete an allocation run
     */
    public function destroyRun(string $id)
    {

        $this->allocationService->deleteRun($id);

        return response()->noContent();
    }
}
