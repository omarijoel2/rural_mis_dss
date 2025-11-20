<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\ValidatesTenantOwnership;
use App\Models\Outage;
use App\Models\OutageAudit;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\MultiPolygon;

class OutageController extends Controller
{
    use ValidatesTenantOwnership;
    public function index(Request $request)
    {
        $query = Outage::query()->with(['scheme', 'dma', 'audits']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('state')) {
            $query->where('state', $request->state);
        }

        if ($request->has('cause')) {
            $query->where('cause', $request->cause);
        }

        if ($request->has('active')) {
            $query->whereIn('state', ['draft', 'approved', 'live']);
        }

        $outages = $query->latest('starts_at')->paginate($request->get('per_page', 20));
        return response()->json($outages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'code' => 'nullable|string|max:32',
            'cause' => 'required|in:planned,fault,water_quality,power,other',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'estimated_customers_affected' => 'nullable|integer',
            'summary' => 'nullable|string',
            'affected_geom' => 'nullable|array',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        $this->validateTenantScheme($validated['scheme_id'], $tenantId);
        $this->validateTenantDma($validated['dma_id'] ?? null, $tenantId);

        $validated['tenant_id'] = $tenantId;
        $validated['state'] = 'draft';

        if (isset($validated['affected_geom'])) {
            $validated['affected_geom'] = MultiPolygon::fromJson(json_encode($validated['affected_geom']));
        }

        $outage = Outage::create($validated);
        $outage->load(['scheme', 'dma']);

        return response()->json($outage, 201);
    }

    public function show(Outage $outage)
    {
        $outage->load(['scheme', 'dma', 'audits.user']);
        return response()->json($outage);
    }

    public function update(Request $request, Outage $outage)
    {
        $validated = $request->validate([
            'ends_at' => 'nullable|date',
            'actual_restored_at' => 'nullable|date',
            'actual_customers_affected' => 'nullable|integer',
            'summary' => 'nullable|string',
            'affected_stats' => 'nullable|array',
            'notifications' => 'nullable|array',
            'isolation_plan' => 'nullable|array',
        ]);

        $outage->update($validated);
        return response()->json($outage);
    }

    public function changeState(Request $request, Outage $outage)
    {
        $validated = $request->validate([
            'state' => 'required|in:draft,approved,live,restored,post_mortem,closed',
            'notes' => 'nullable|string',
        ]);

        $oldState = $outage->state;
        $outage->update(['state' => $validated['state']]);

        OutageAudit::create([
            'outage_id' => $outage->id,
            'event' => "state_changed_{$oldState}_to_{$validated['state']}",
            'meta' => ['notes' => $validated['notes'] ?? null],
            'user_id' => auth()->id(),
        ]);

        return response()->json($outage);
    }

    public function destroy(Outage $outage)
    {
        $outage->delete();
        return response()->json(['message' => 'Outage deleted successfully'], 204);
    }
}
