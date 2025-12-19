<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WaterQuality\ComplianceService;
use Illuminate\Http\Request;

class WqComplianceController extends Controller
{
    public function __construct(protected ComplianceService $complianceService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('view water quality compliance');

        $filters = $request->only(['sampling_point_id', 'parameter_id', 'granularity', 'has_breaches']);
        $compliance = $this->complianceService->listCompliance($request->user(), $filters, $request->get('per_page', 15));

        return response()->json($compliance);
    }

    public function compute(Request $request)
    {
        $this->authorize('compute water quality compliance');

        $validated = $request->validate([
            'sampling_point_id' => 'required|integer|exists:wq_sampling_points,id',
            'parameter_id' => 'required|integer|exists:wq_parameters,id',
            'period' => 'required|date',
            'granularity' => 'required|in:week,month,quarter',
        ]);

        $compliance = $this->complianceService->computeCompliance(
            $validated['sampling_point_id'],
            $validated['parameter_id'],
            $validated['period'],
            $validated['granularity'],
            $request->user()
        );

        return response()->json($compliance, 201);
    }

    public function computeAll(Request $request)
    {
        $this->authorize('compute water quality compliance');

        $validated = $request->validate([
            'period' => 'required|date',
            'granularity' => 'required|in:week,month,quarter',
        ]);

        $computed = $this->complianceService->computeAllCompliance(
            $validated['period'],
            $validated['granularity'],
            $request->user()
        );

        return response()->json([
            'message' => 'Compliance computed for all points and parameters',
            'count' => count($computed),
        ]);
    }

    public function summary(Request $request)
    {
        $this->authorize('view water quality compliance');

        $filters = $request->only(['granularity', 'period_from', 'period_to']);
        $summary = $this->complianceService->getComplianceSummary($request->user(), $filters);

        return response()->json($summary);
    }
}
