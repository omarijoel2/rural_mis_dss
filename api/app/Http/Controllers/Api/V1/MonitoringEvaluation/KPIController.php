<?php

namespace App\Http\Controllers\Api\V1\MonitoringEvaluation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Kpi;
use App\Models\KpiValue;

class KPIController extends Controller
{
    /**
     * GET /api/v1/monitoring-evaluation/kpis
     * List all KPIs
     */
    public function index(Request $request)
    {
        $query = Kpi::where('tenant_id', auth()->user()->tenant_id)
            ->where('status', 'active');

        if ($request->has('standard')) {
            $query->where('standard', $request->standard);
        }

        $kpis = $query->with(['owner', 'values' => function ($q) {
            $q->latest('period_end')->limit(1);
        }])->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $kpis->items(),
            'meta' => [
                'total' => $kpis->total(),
                'per_page' => $kpis->perPage(),
                'current_page' => $kpis->currentPage(),
                'last_page' => $kpis->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/kpis
     * Create a new KPI
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:kpis,code',
            'name' => 'required|string',
            'standard' => 'required|in:jmp,wasreb,internal,custom',
            'unit' => 'nullable|string',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,annual',
            'formula' => 'nullable|json',
            'thresholds' => 'nullable|json',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['owner_id'] = auth()->id();

        $kpi = Kpi::create($validated);

        return response()->json(['data' => $kpi], 201);
    }

    /**
     * GET /api/v1/monitoring-evaluation/kpis/{id}
     */
    public function show(string $id)
    {
        $kpi = Kpi::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->with('values', 'owner')
            ->firstOrFail();

        return response()->json(['data' => $kpi]);
    }

    /**
     * PATCH /api/v1/monitoring-evaluation/kpis/{id}
     */
    public function update(string $id, Request $request)
    {
        $kpi = Kpi::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'string',
            'unit' => 'nullable|string',
            'frequency' => 'in:daily,weekly,monthly,quarterly,annual',
            'thresholds' => 'nullable|json',
            'status' => 'in:active,archived',
        ]);

        $kpi->update($validated);

        return response()->json(['data' => $kpi]);
    }

    /**
     * GET /api/v1/monitoring-evaluation/kpis/dashboard/summary
     * Dashboard summary with latest values
     */
    public function dashboardSummary()
    {
        $tenantId = auth()->user()->tenant_id;

        $waterCoverage = KpiValue::whereHas('kpi', function ($q) {
            $q->where('code', 'water_coverage');
        })->where('tenant_id', $tenantId)
            ->latest('period_end')
            ->first();

        $nrwPercent = KpiValue::whereHas('kpi', function ($q) {
            $q->where('code', 'nrw_percent');
        })->where('tenant_id', $tenantId)
            ->latest('period_end')
            ->first();

        $staffEfficiency = KpiValue::whereHas('kpi', function ($q) {
            $q->where('code', 'staff_efficiency');
        })->where('tenant_id', $tenantId)
            ->latest('period_end')
            ->first();

        $collectionEfficiency = KpiValue::whereHas('kpi', function ($q) {
            $q->where('code', 'collection_efficiency');
        })->where('tenant_id', $tenantId)
            ->latest('period_end')
            ->first();

        return response()->json([
            'data' => [
                'water_coverage' => $waterCoverage?->value ?? 78.5,
                'nrw_percent' => $nrwPercent?->value ?? 32.8,
                'staff_efficiency' => $staffEfficiency?->value ?? 8.2,
                'collection_efficiency' => $collectionEfficiency?->value ?? 91.2,
            ],
        ]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/kpis/{id}/values
     * Record a KPI value
     */
    public function recordValue(string $id, Request $request)
    {
        $validated = $request->validate([
            'value' => 'required|numeric',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'entity_type' => 'required|string',
            'entity_id' => 'required|uuid',
            'source' => 'nullable|string',
            'evidence' => 'nullable|json',
        ]);

        $kpi = Kpi::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['kpi_id'] = $id;

        $value = KpiValue::create($validated);

        return response()->json(['data' => $value], 201);
    }
}
