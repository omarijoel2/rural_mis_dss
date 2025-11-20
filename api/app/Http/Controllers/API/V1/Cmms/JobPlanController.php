<?php

namespace App\Http\Controllers\API\V1\Cmms;

use App\Http\Controllers\Controller;
use App\Models\JobPlan;
use App\Services\Cmms\JobPlanService;
use Illuminate\Http\Request;

class JobPlanController extends Controller
{
    public function __construct(protected JobPlanService $jobPlanService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['status', 'asset_class_id', 'search']);
        $jobPlans = $this->jobPlanService->getAllJobPlans($filters);
        return response()->json($jobPlans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'asset_class_id' => 'nullable|integer|exists:asset_classes,id',
            'version' => 'nullable|integer',
            'status' => 'nullable|in:draft,active,archived',
            'sop' => 'nullable|string',
            'checklist' => 'nullable|array',
            'required_tools' => 'nullable|array',
            'labor_roles' => 'nullable|array',
            'required_parts' => 'nullable|array',
            'risk_notes' => 'nullable|string',
            'permit_type' => 'nullable|string',
            'estimated_hours' => 'nullable|numeric',
            'estimated_cost' => 'nullable|numeric'
        ]);

        $jobPlan = $this->jobPlanService->createJobPlan($validated);
        return response()->json($jobPlan, 201);
    }

    public function show(int $id)
    {
        $jobPlan = $this->jobPlanService->getJobPlan($id);
        return response()->json($jobPlan);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'asset_class_id' => 'nullable|integer|exists:asset_classes,id',
            'status' => 'in:draft,active,archived',
            'sop' => 'nullable|string',
            'checklist' => 'nullable|array',
            'required_tools' => 'nullable|array',
            'labor_roles' => 'nullable|array',
            'required_parts' => 'nullable|array',
            'risk_notes' => 'nullable|string',
            'permit_type' => 'nullable|string',
            'estimated_hours' => 'nullable|numeric',
            'estimated_cost' => 'nullable|numeric'
        ]);

        $jobPlan = $this->jobPlanService->updateJobPlan($id, $validated);
        return response()->json($jobPlan);
    }

    public function destroy(int $id)
    {
        $this->jobPlanService->deleteJobPlan($id);
        return response()->json(['message' => 'Job plan deleted successfully'], 204);
    }

    public function createVersion(int $id)
    {
        $newVersion = $this->jobPlanService->createNewVersion($id);
        return response()->json($newVersion, 201);
    }

    public function activate(int $id)
    {
        $jobPlan = $this->jobPlanService->activateJobPlan($id);
        return response()->json($jobPlan);
    }
}
