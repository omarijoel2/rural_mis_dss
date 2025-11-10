<?php

namespace App\Http\Controllers\Api\V1\Costing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Costing\CalculateCostToServeRequest;
use App\Services\Costing\CostToServeService;
use Illuminate\Http\Request;

class CostingKpiController extends Controller
{
    private CostToServeService $costToServeService;

    public function __construct(CostToServeService $costToServeService)
    {
        $this->costToServeService = $costToServeService;
    }

    /**
     * GET /api/v1/costing/cost-to-serve
     * Get cost-to-serve metrics with filters
     */
    public function index(Request $request)
    {

        $filters = $request->only(['period_from', 'period_to', 'scheme_id', 'dma_id', 'class']);
        $metrics = $this->costToServeService->getMetrics($filters);

        return response()->json([
            'data' => $metrics,
            'meta' => [
                'total' => $metrics->count(),
            ],
        ]);
    }

    /**
     * POST /api/v1/costing/cost-to-serve
     * Calculate and store cost-to-serve metrics
     */
    public function calculate(CalculateCostToServeRequest $request)
    {

        $metrics = $this->costToServeService->calculateMetrics($request->validated());

        return response()->json([
            'data' => $metrics,
            'message' => 'Cost-to-serve metrics calculated successfully.',
        ], 201);
    }

    /**
     * GET /api/v1/costing/cost-to-serve/summary
     * Get summary statistics
     */
    public function summary(Request $request)
    {

        $filters = $request->only(['period_from', 'period_to', 'scheme_id']);
        $stats = $this->costToServeService->getSummaryStats($filters);

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * GET /api/v1/costing/cost-to-serve/dma-league/{period}
     * Get DMA league table for a period
     */
    public function dmaLeague(string $period)
    {

        $leagueTable = $this->costToServeService->getDmaLeagueTable($period);

        return response()->json([
            'data' => $leagueTable,
        ]);
    }

    /**
     * GET /api/v1/costing/cost-to-serve/trends
     * Get trend data for charting
     */
    public function trends(Request $request)
    {

        $filters = $request->only(['period_from', 'period_to', 'scheme_id', 'dma_id']);
        $trends = $this->costToServeService->getTrendData($filters);

        return response()->json([
            'data' => $trends,
        ]);
    }
}
