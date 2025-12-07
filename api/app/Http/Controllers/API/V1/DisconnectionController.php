<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Disconnection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DisconnectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Disconnection::with(['customer', 'executedBy']);

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('reason')) {
            $query->where('reason', $request->reason);
        }

        $disconnections = $query->orderBy('scheduled_date', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $disconnections->items(),
            'meta' => [
                'current_page' => $disconnections->currentPage(),
                'last_page' => $disconnections->lastPage(),
                'per_page' => $disconnections->perPage(),
                'total' => $disconnections->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|uuid|exists:users,id',
            'account_no' => 'required|string|max:50',
            'reason' => 'required|in:non_payment,illegal_connection,tampering,temporary,customer_request',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;
        $validated['status'] = 'scheduled';

        $disconnection = Disconnection::create($validated);

        return response()->json(['data' => $disconnection->load(['customer'])], 201);
    }

    public function show(Disconnection $disconnection): JsonResponse
    {
        $disconnection->load(['customer', 'executedBy']);
        return response()->json(['data' => $disconnection]);
    }

    public function execute(Request $request, Disconnection $disconnection): JsonResponse
    {
        if ($disconnection->status !== 'scheduled') {
            return response()->json(['error' => 'Only scheduled disconnections can be executed'], 400);
        }

        $disconnection->update([
            'status' => 'executed',
            'executed_at' => now(),
            'executed_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $disconnection]);
    }

    public function reconnect(Request $request, Disconnection $disconnection): JsonResponse
    {
        if ($disconnection->status !== 'executed') {
            return response()->json(['error' => 'Only executed disconnections can be reconnected'], 400);
        }

        $disconnection->update([
            'status' => 'reconnected',
            'reconnected_at' => now(),
        ]);

        return response()->json(['data' => $disconnection]);
    }

    public function destroy(Disconnection $disconnection): JsonResponse
    {
        if ($disconnection->status !== 'scheduled') {
            return response()->json(['error' => 'Only scheduled disconnections can be deleted'], 400);
        }

        $disconnection->delete();
        return response()->json(null, 204);
    }
}
