<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmInteraction;
use App\Models\CrmPremise;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class InteractionController extends Controller
{
    public function index(Request $request)
    {
        $query = CrmInteraction::where('tenant_id', auth()->user()->currentTenantId());

        if ($request->has('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->has('premise_id')) {
            $query->where('premise_id', $request->premise_id);
        }

        $interactions = $query->orderBy('logged_at', 'desc')
            ->with(['premise', 'user'])
            ->paginate($request->get('per_page', 15));

        return response()->json($interactions);
    }

    public function store(Request $request)
    {
        $tenantId = auth()->user()->currentTenantId();

        $request->validate([
            'premise_id' => 'required|integer',
            'channel' => 'required|in:phone,email,sms,web_portal,walk_in,field_visit',
            'direction' => 'required|in:inbound,outbound',
            'summary' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $premise = CrmPremise::where('tenant_id', $tenantId)
            ->where('id', $request->premise_id)
            ->first();

        if (!$premise) {
            throw ValidationException::withMessages([
                'premise_id' => ['The selected premise does not exist or does not belong to your organization.']
            ]);
        }

        $interaction = CrmInteraction::create([
            'tenant_id' => $tenantId,
            'premise_id' => $request->premise_id,
            'channel' => $request->channel,
            'direction' => $request->direction,
            'summary' => $request->summary,
            'notes' => $request->notes,
            'logged_by' => auth()->id(),
            'logged_at' => now(),
        ]);

        $interaction->load(['premise', 'user']);

        return response()->json($interaction, 201);
    }

    public function show(int $id)
    {
        $interaction = CrmInteraction::where('tenant_id', auth()->user()->currentTenantId())
            ->with(['premise', 'user'])
            ->findOrFail($id);

        return response()->json($interaction);
    }
}
