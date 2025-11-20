<?php

namespace App\Http\Controllers\API\V1\Cmms;

use App\Http\Controllers\Controller;
use App\Services\Cmms\ConditionMonitoringService;
use Illuminate\Http\Request;

class ConditionMonitoringController extends Controller
{
    public function __construct(protected ConditionMonitoringService $conditionService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['asset_id', 'health_status', 'is_active']);
        $tags = $this->conditionService->getAllTags($filters);
        return response()->json($tags);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|integer|exists:assets,id',
            'tag' => 'required|string|max:255',
            'parameter' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'thresholds' => 'required|array',
            'is_active' => 'boolean'
        ]);

        $tag = $this->conditionService->createTag($validated);
        return response()->json($tag, 201);
    }

    public function show(int $id)
    {
        $tag = $this->conditionService->getTag($id);
        return response()->json($tag);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'tag' => 'string|max:255',
            'parameter' => 'string|max:255',
            'unit' => 'string|max:255',
            'thresholds' => 'array',
            'is_active' => 'boolean'
        ]);

        $tag = $this->conditionService->updateTag($id, $validated);
        return response()->json($tag);
    }

    public function destroy(int $id)
    {
        $this->conditionService->deleteTag($id);
        return response()->json(['message' => 'Tag deleted successfully'], 204);
    }

    public function ingestReading(Request $request, int $tagId)
    {
        $validated = $request->validate([
            'value' => 'required|numeric',
            'source' => 'nullable|string'
        ]);

        $reading = $this->conditionService->ingestReading(
            $tagId,
            $validated['value'],
            $validated['source'] ?? null
        );

        return response()->json($reading, 201);
    }

    public function acknowledgeAlarm(Request $request, int $alarmId)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string'
        ]);

        $alarm = $this->conditionService->acknowledgeAlarm($alarmId, $validated['notes'] ?? null);
        return response()->json($alarm);
    }

    public function clearAlarm(int $alarmId)
    {
        $alarm = $this->conditionService->clearAlarm($alarmId);
        return response()->json($alarm);
    }

    public function assetHealth(int $assetId)
    {
        $health = $this->conditionService->calculateAssetHealth($assetId);
        return response()->json($health);
    }

    public function evaluateRules()
    {
        $triggers = $this->conditionService->evaluatePredictiveRules();
        return response()->json([
            'message' => 'Predictive rules evaluated',
            'triggers_count' => $triggers->count(),
            'triggers' => $triggers
        ]);
    }
}
