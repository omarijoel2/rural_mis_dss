<?php

namespace App\Http\Controllers\Api\V1\MonitoringEvaluation;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\NrwInitiative;
use App\Models\NrwSaving;

class NRWController extends Controller
{
    /**
     * GET /api/v1/monitoring-evaluation/nrw/initiatives
     */
    public function listInitiatives(Request $request)
    {
        $query = NrwInitiative::where('tenant_id', auth()->user()->tenant_id);

        if ($request->has('stage')) {
            $query->where('stage', $request->stage);
        }

        $initiatives = $query->with('scheme')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $initiatives->items(),
            'meta' => [
                'total' => $initiatives->total(),
                'per_page' => $initiatives->perPage(),
                'current_page' => $initiatives->currentPage(),
                'last_page' => $initiatives->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/nrw/initiatives
     */
    public function storeInitiative(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'name' => 'required|string',
            'type' => 'required|in:pressure_mgmt,leak_detection,meter_replacement,sectorization,prv_optimization,other',
            'dma_ids' => 'nullable|json',
            'cost' => 'required|numeric|min:0',
            'estimated_savings_m3_day' => 'nullable|numeric|min:0',
            'stage' => 'required|in:proposed,approved,in_implementation,verified,closed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'assumptions' => 'nullable|string',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        if ($validated['estimated_savings_m3_day'] && $validated['cost']) {
            $validated['roi_percent'] = ($validated['estimated_savings_m3_day'] * 365 * 0.15 / $validated['cost']) * 100;
        }

        $initiative = NrwInitiative::create($validated);

        return response()->json(['data' => $initiative], 201);
    }

    /**
     * GET /api/v1/monitoring-evaluation/nrw/initiatives/{id}
     */
    public function showInitiative(string $id)
    {
        $initiative = NrwInitiative::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->with(['scheme', 'savings' => function ($q) {
                $q->orderBy('date', 'desc')->limit(12);
            }])
            ->firstOrFail();

        return response()->json(['data' => $initiative]);
    }

    /**
     * GET /api/v1/monitoring-evaluation/nrw/dashboard
     */
    public function dashboard()
    {
        $tenantId = auth()->user()->tenant_id;

        $activeInitiatives = NrwInitiative::where('tenant_id', $tenantId)
            ->where('stage', 'in_implementation')
            ->count();

        $totalSavings = NrwSaving::whereHas('initiative', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->sum('realized_savings_m3_day');

        $totalInvestment = NrwInitiative::where('tenant_id', $tenantId)
            ->whereIn('stage', ['in_implementation', 'verified', 'closed'])
            ->sum('cost');

        $avgROI = NrwInitiative::where('tenant_id', $tenantId)
            ->whereNotNull('roi_percent')
            ->avg('roi_percent') ?? 0;

        return response()->json([
            'data' => [
                'current_nrw_percent' => 32.8,
                'active_initiatives' => $activeInitiatives,
                'water_saved_m3_day' => $totalSavings,
                'total_investment' => $totalInvestment,
                'average_roi_percent' => $avgROI,
            ],
        ]);
    }

    /**
     * POST /api/v1/monitoring-evaluation/nrw/initiatives/{id}/savings
     */
    public function recordSaving(string $id, Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'realized_savings_m3_day' => 'required|numeric|min:0',
            'confidence_percent' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        NrwInitiative::where('tenant_id', auth()->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['initiative_id'] = $id;

        $saving = NrwSaving::create($validated);

        return response()->json(['data' => $saving], 201);
    }
}
