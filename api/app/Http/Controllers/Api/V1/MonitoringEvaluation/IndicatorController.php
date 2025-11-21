<?php

namespace App\Http\Controllers\Api\V1\MonitoringEvaluation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Indicator;
use App\Models\IndicatorDataPoint;

class IndicatorController extends Controller
{
    /**
     * GET /api/v1/monitoring-evaluation/indicators
     */
    public function index(Request $request)
    {
        $query = Indicator::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        $indicators = $query->with(['owner', 'dataPoints' => function ($q) {
            $q->latest('date')->limit(5);
        }])->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $indicators->items(),
            'meta' => [
                'total' => $indicators->total(),
                'per_page' => $indicators->perPage(),
                'current_page' => $indicators->currentPage(),
                'last_page' => $indicators->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/indicators
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:indicators,code',
            'name' => 'required|string',
            'level' => 'required|in:impact,outcome,output,activity',
            'unit' => 'nullable|string',
            'baseline_value' => 'nullable|numeric',
            'baseline_date' => 'nullable|date',
            'target_value' => 'nullable|numeric',
            'target_date' => 'nullable|date',
            'frequency' => 'required|in:monthly,quarterly,annual,milestone',
            'means_of_verification' => 'nullable|string',
            'disaggregation_schema' => 'nullable|json',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['owner_id'] = auth()->id();

        $indicator = Indicator::create($validated);

        return response()->json(['data' => $indicator], 201);
    }

    /**
     * GET /api/v1/monitoring-evaluation/indicators/{id}
     */
    public function show(string $id)
    {
        $indicator = Indicator::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->with(['owner', 'dataPoints' => function ($q) {
                $q->orderBy('date', 'desc')->limit(24);
            }])
            ->firstOrFail();

        return response()->json(['data' => $indicator]);
    }

    /**
     * PATCH /api/v1/monitoring-evaluation/indicators/{id}
     */
    public function update(string $id, Request $request)
    {
        $indicator = Indicator::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'string',
            'target_value' => 'nullable|numeric',
            'target_date' => 'nullable|date',
            'means_of_verification' => 'nullable|string',
        ]);

        $indicator->update($validated);

        return response()->json(['data' => $indicator]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/indicators/{id}/data-points
     * Record indicator data point
     */
    public function recordDataPoint(string $id, Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'value' => 'required|numeric',
            'source' => 'nullable|string',
            'disaggregation' => 'nullable|json',
            'meta' => 'nullable|json',
        ]);

        Indicator::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['indicator_id'] = $id;

        $point = IndicatorDataPoint::create($validated);

        return response()->json(['data' => $point], 201);
    }
}
