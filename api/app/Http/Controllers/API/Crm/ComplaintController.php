<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmComplaint;
use App\Models\CrmPremise;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $query = CrmComplaint::where('tenant_id', auth()->user()->currentTenantId());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $complaints = $query->orderBy('opened_at', 'desc')
            ->with(['premise', 'openedBy', 'assignedTo'])
            ->paginate($request->get('per_page', 15));

        return response()->json($complaints);
    }

    public function store(Request $request)
    {
        $tenantId = auth()->user()->currentTenantId();

        $request->validate([
            'premise_id' => 'required|integer',
            'category' => 'required|in:billing,water_quality,supply,meter,leak,customer_service,other',
            'priority' => 'required|in:low,medium,high,critical',
            'description' => 'required|string',
            'location' => 'nullable|array',
        ]);

        $premise = CrmPremise::where('tenant_id', $tenantId)
            ->where('id', $request->premise_id)
            ->first();

        if (!$premise) {
            throw ValidationException::withMessages([
                'premise_id' => ['The selected premise does not exist or does not belong to your organization.']
            ]);
        }

        $data = [
            'tenant_id' => $tenantId,
            'premise_id' => $request->premise_id,
            'category' => $request->category,
            'priority' => $request->priority,
            'description' => $request->description,
            'status' => 'open',
            'opened_by' => auth()->id(),
            'opened_at' => now(),
        ];

        if ($request->has('location') && is_array($request->location)) {
            $data['location'] = \MatanYadaev\EloquentSpatial\Objects\Point::fromArray($request->location);
        }

        $complaint = CrmComplaint::create($data);
        $complaint->load(['premise', 'openedBy']);

        return response()->json($complaint, 201);
    }

    public function show(int $id)
    {
        $complaint = CrmComplaint::where('tenant_id', auth()->user()->currentTenantId())
            ->with(['premise', 'openedBy', 'assignedTo', 'resolvedBy', 'closedBy'])
            ->findOrFail($id);

        return response()->json($complaint);
    }

    public function update(Request $request, int $id)
    {
        $tenantId = auth()->user()->currentTenantId();
        
        $complaint = CrmComplaint::where('tenant_id', $tenantId)
            ->findOrFail($id);

        $request->validate([
            'status' => 'sometimes|in:open,triage,field,resolved,closed',
            'assigned_to' => 'nullable|integer',
            'resolution_notes' => 'nullable|string',
        ]);

        if ($request->filled('assigned_to')) {
            $user = User::where('id', $request->assigned_to)
                ->whereHas('tenant', function ($q) use ($tenantId) {
                    $q->where('id', $tenantId);
                })
                ->first();

            if (!$user) {
                throw ValidationException::withMessages([
                    'assigned_to' => ['The selected user does not exist or does not belong to your organization.']
                ]);
            }
        }

        $data = $request->only(['status', 'assigned_to', 'resolution_notes']);

        if ($request->status === 'resolved' && !$complaint->resolved_at) {
            $data['resolved_by'] = auth()->id();
            $data['resolved_at'] = now();
        }

        if ($request->status === 'closed' && !$complaint->closed_at) {
            $data['closed_by'] = auth()->id();
            $data['closed_at'] = now();
        }

        $complaint->update($data);
        $complaint->load(['premise', 'openedBy', 'assignedTo', 'resolvedBy', 'closedBy']);

        return response()->json($complaint);
    }
}
