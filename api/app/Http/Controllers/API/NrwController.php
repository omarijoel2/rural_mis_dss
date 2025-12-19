<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\ValidatesTenantOwnership;
use App\Models\NrwSnapshot;
use App\Models\Intervention;
use Illuminate\Http\Request;

class NrwController extends Controller
{
    use ValidatesTenantOwnership;
    public function snapshots(Request $request)
    {
        $query = NrwSnapshot::query()->with('dma');

        if ($request->has('dma_id')) {
            $query->where('dma_id', $request->dma_id);
        }

        if ($request->has('from')) {
            $query->where('as_of', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('as_of', '<=', $request->to);
        }

        $snapshots = $query->latest('as_of')->paginate($request->get('per_page', 30));
        return response()->json($snapshots);
    }

    public function storeSnapshot(Request $request)
    {
        $validated = $request->validate([
            'dma_id' => 'required|uuid|exists:dmas,id',
            'as_of' => 'required|date',
            'system_input_volume_m3' => 'required|numeric',
            'billed_authorized_m3' => 'required|numeric',
            'unbilled_authorized_m3' => 'nullable|numeric',
            'apparent_losses_m3' => 'nullable|numeric',
            'real_losses_m3' => 'nullable|numeric',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        $this->validateTenantDma($validated['dma_id'], $tenantId);

        $validated['tenant_id'] = $tenantId;
        
        $nrw_m3 = ($validated['apparent_losses_m3'] ?? 0) + ($validated['real_losses_m3'] ?? 0);
        $validated['nrw_m3'] = $nrw_m3;
        $validated['nrw_pct'] = $validated['system_input_volume_m3'] > 0 
            ? ($nrw_m3 / $validated['system_input_volume_m3']) * 100 
            : 0;

        $snapshot = NrwSnapshot::create($validated);
        return response()->json($snapshot, 201);
    }

    public function interventions(Request $request)
    {
        $query = Intervention::query()->with(['dma', 'asset']);

        if ($request->has('dma_id')) {
            $query->where('dma_id', $request->dma_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $interventions = $query->latest('date')->paginate($request->get('per_page', 30));
        return response()->json($interventions);
    }

    public function storeIntervention(Request $request)
    {
        $validated = $request->validate([
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'asset_id' => 'nullable|integer|exists:assets,id',
            'type' => 'required|in:leak_repair,meter_replacement,prv_tuning,sectorization,campaign,other',
            'date' => 'required|date',
            'estimated_savings_m3d' => 'nullable|numeric',
            'realized_savings_m3d' => 'nullable|numeric',
            'cost' => 'nullable|numeric',
            'responsible' => 'nullable|string',
            'follow_up_at' => 'nullable|date',
            'evidence' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        $this->validateTenantDma($validated['dma_id'] ?? null, $tenantId);
        $this->validateTenantAsset($validated['asset_id'] ?? null, $tenantId);

        $validated['tenant_id'] = $tenantId;

        $intervention = Intervention::create($validated);
        return response()->json($intervention, 201);
    }
}
