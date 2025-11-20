<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\ValidatesTenantOwnership;
use App\Models\DosePlan;
use App\Models\ChemicalStock;
use App\Models\DoseChangeLog;
use Illuminate\Http\Request;

class DosingController extends Controller
{
    use ValidatesTenantOwnership;
    public function plans(Request $request)
    {
        $query = DosePlan::query()->with(['scheme', 'asset']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        $plans = $query->paginate($request->get('per_page', 30));
        return response()->json($plans);
    }

    public function storePlan(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'asset_id' => 'nullable|uuid|exists:assets,id',
            'chemical' => 'nullable|string',
            'flow_bands' => 'nullable|array',
            'thresholds' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        $this->validateTenantScheme($validated['scheme_id'], $tenantId);
        $this->validateTenantAsset($validated['asset_id'] ?? null, $tenantId);

        $validated['tenant_id'] = $tenantId;

        $plan = DosePlan::create($validated);
        return response()->json($plan, 201);
    }

    public function stocks(Request $request)
    {
        $query = ChemicalStock::query()->with(['scheme', 'facility']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('chemical')) {
            $query->where('chemical', $request->chemical);
        }

        $stocks = $query->latest('as_of')->paginate($request->get('per_page', 30));
        return response()->json($stocks);
    }

    public function storeStock(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'facility_id' => 'nullable|uuid|exists:facilities,id',
            'chemical' => 'required|string',
            'qty_on_hand_kg' => 'required|numeric',
            'reorder_level_kg' => 'nullable|numeric',
            'as_of' => 'required|date',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        $this->validateTenantScheme($validated['scheme_id'], $tenantId);
        $this->validateTenantFacility($validated['facility_id'] ?? null, $tenantId);

        $validated['tenant_id'] = $tenantId;

        $stock = ChemicalStock::create($validated);
        return response()->json($stock, 201);
    }
}
