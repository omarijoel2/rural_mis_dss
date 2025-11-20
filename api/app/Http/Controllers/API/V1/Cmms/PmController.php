<?php

namespace App\Http\Controllers\API\V1\Cmms;

use App\Http\Controllers\Controller;
use App\Services\Cmms\PmService;
use Illuminate\Http\Request;

class PmController extends Controller
{
    public function __construct(protected PmService $pmService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['is_active', 'asset_class_id', 'trigger_type']);
        $templates = $this->pmService->getAllTemplates($filters);
        return response()->json($templates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_class_id' => 'required|integer|exists:asset_classes,id',
            'job_plan_id' => 'nullable|integer|exists:job_plans,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|in:time_based,usage_based,combined',
            'frequency_days' => 'nullable|integer',
            'tolerance_days' => 'nullable|integer',
            'usage_counters' => 'nullable|array',
            'is_active' => 'boolean',
            'checklist' => 'nullable|array',
            'kit' => 'nullable|array'
        ]);

        $template = $this->pmService->createTemplate($validated);
        return response()->json($template, 201);
    }

    public function show(int $id)
    {
        $template = $this->pmService->getTemplate($id);
        return response()->json($template);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'asset_class_id' => 'integer|exists:asset_classes,id',
            'job_plan_id' => 'nullable|integer|exists:job_plans,id',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'in:time_based,usage_based,combined',
            'frequency_days' => 'nullable|integer',
            'tolerance_days' => 'nullable|integer',
            'usage_counters' => 'nullable|array',
            'is_active' => 'boolean',
            'checklist' => 'nullable|array',
            'kit' => 'nullable|array'
        ]);

        $template = $this->pmService->updateTemplate($id, $validated);
        return response()->json($template);
    }

    public function destroy(int $id)
    {
        $this->pmService->deleteTemplate($id);
        return response()->json(['message' => 'PM template deleted successfully'], 204);
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'nullable|integer|exists:pm_templates,id'
        ]);

        $workOrders = $this->pmService->generateWorkOrders($validated['template_id'] ?? null);
        return response()->json([
            'message' => 'Work orders generated successfully',
            'count' => $workOrders->count(),
            'work_orders' => $workOrders
        ], 201);
    }

    public function defer(Request $request, int $logId)
    {
        $validated = $request->validate([
            'deferred_to' => 'required|date',
            'reason_code' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        $deferral = $this->pmService->deferPm(
            $logId,
            $validated['deferred_to'],
            $validated['reason_code'],
            $validated['notes'] ?? null
        );

        return response()->json($deferral, 201);
    }

    public function compliance(Request $request)
    {
        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start'
        ]);

        $metrics = $this->pmService->calculateCompliance(
            $validated['period_start'],
            $validated['period_end']
        );

        return response()->json($metrics);
    }
}
