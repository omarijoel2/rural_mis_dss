<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\CrmTicket;
use App\Models\TicketCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CrmTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CrmTicket::with(['category', 'customer', 'assignedTo']);

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $tickets->items(),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
                'total' => $tickets->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|uuid|exists:users,id',
            'category_id' => 'required|uuid|exists:ticket_categories,id',
            'channel' => 'required|in:sms,ussd,whatsapp,email,phone,app,walk_in',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;
        $validated['ticket_no'] = 'TKT-' . strtoupper(substr(md5(uniqid()), 0, 8));
        $validated['status'] = 'new';

        $category = TicketCategory::find($validated['category_id']);
        if ($category) {
            $validated['sla_response_due'] = now()->addHours($category->sla_response_hours);
            $validated['sla_resolution_due'] = now()->addHours($category->sla_resolution_hours);
        }

        $ticket = CrmTicket::create($validated);

        return response()->json(['data' => $ticket->load(['category'])], 201);
    }

    public function show(CrmTicket $ticket): JsonResponse
    {
        $ticket->load(['category', 'customer', 'assignedTo', 'threads.user']);
        return response()->json(['data' => $ticket]);
    }

    public function update(Request $request, CrmTicket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:new,assigned,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'assigned_to' => 'nullable|uuid|exists:users,id',
        ]);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'assigned' && !$ticket->responded_at) {
                $validated['responded_at'] = now();
            }
            if ($validated['status'] === 'resolved' && !$ticket->resolved_at) {
                $validated['resolved_at'] = now();
            }
            if ($validated['status'] === 'closed' && !$ticket->closed_at) {
                $validated['closed_at'] = now();
            }
        }

        $ticket->update($validated);

        return response()->json(['data' => $ticket->load(['category', 'assignedTo'])]);
    }

    public function destroy(CrmTicket $ticket): JsonResponse
    {
        $ticket->delete();
        return response()->json(null, 204);
    }

    public function categories(Request $request): JsonResponse
    {
        $query = TicketCategory::query();

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        return response()->json(['data' => $query->orderBy('name')->get()]);
    }
}
