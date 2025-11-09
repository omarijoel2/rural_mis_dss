<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WaterQuality\PlanService;
use Illuminate\Http\Request;

class WqPlanController extends Controller
{
    public function __construct(protected PlanService $planService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('view water quality plans');

        $filters = $request->only(['status']);
        $plans = $this->planService->listPlans($request->user(), $filters, $request->get('per_page', 15));

        return response()->json($plans);
    }

    public function store(Request $request)
    {
        $this->authorize('create water quality plans');

        $plan = $this->planService->createPlan($request->all(), $request->user());

        return response()->json($plan, 201);
    }

    public function show(int $planId, Request $request)
    {
        $this->authorize('view water quality plans');

        $plan = \App\Models\WqPlan::where('tenant_id', $request->user()->currentTenantId())
            ->with(['rules'])
            ->findOrFail($planId);

        return response()->json($plan);
    }

    public function addRule(int $planId, Request $request)
    {
        $this->authorize('edit water quality plans');

        $rule = $this->planService->addRule($planId, $request->all(), $request->user());

        return response()->json($rule, 201);
    }

    public function activate(int $planId, Request $request)
    {
        $this->authorize('edit water quality plans');

        $plan = $this->planService->activatePlan($planId, $request->user());

        return response()->json($plan);
    }

    public function generateTasks(int $planId, Request $request)
    {
        $this->authorize('create water quality samples');

        $samples = $this->planService->generateTasks($planId, $request->user());

        return response()->json([
            'message' => 'Sampling tasks generated successfully',
            'count' => count($samples),
        ]);
    }
}
