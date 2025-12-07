<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\PaymentReconciliation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentReconciliationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PaymentReconciliation::with(['reconciledBy']);

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('channel')) {
            $query->where('channel', $request->channel);
        }

        $reconciliations = $query->orderBy('reconciliation_date', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $reconciliations->items(),
            'meta' => [
                'current_page' => $reconciliations->currentPage(),
                'last_page' => $reconciliations->lastPage(),
                'per_page' => $reconciliations->perPage(),
                'total' => $reconciliations->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reconciliation_date' => 'required|date',
            'channel' => 'required|in:mpesa,bank,cash,card,other',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;
        $validated['reconciliation_code'] = 'REC-' . now()->format('YmdHis');
        $validated['reconciled_by'] = $request->user()->id;
        $validated['status'] = 'draft';

        $reconciliation = PaymentReconciliation::create($validated);

        return response()->json(['data' => $reconciliation], 201);
    }

    public function show(PaymentReconciliation $reconciliation): JsonResponse
    {
        $reconciliation->load(['reconciledBy']);
        return response()->json(['data' => $reconciliation]);
    }

    public function complete(Request $request, PaymentReconciliation $reconciliation): JsonResponse
    {
        if ($reconciliation->status !== 'draft') {
            return response()->json(['error' => 'Only draft reconciliations can be completed'], 400);
        }

        $reconciliation->update([
            'status' => 'completed',
            'payments_matched' => $request->payments_matched ?? 0,
            'payments_unmatched' => $request->payments_unmatched ?? 0,
            'amount_matched' => $request->amount_matched ?? 0,
            'amount_unmatched' => $request->amount_unmatched ?? 0,
        ]);

        return response()->json(['data' => $reconciliation]);
    }

    public function aging(Request $request): JsonResponse
    {
        $tenantId = $request->user()?->current_tenant_id;

        $summary = [
            'total_accounts' => 0,
            'total_outstanding' => 0,
            'current' => 0,
            'days_30' => 0,
            'days_60' => 0,
            'days_90' => 0,
            'over_90' => 0,
        ];

        return response()->json(['summary' => $summary]);
    }

    public function destroy(PaymentReconciliation $reconciliation): JsonResponse
    {
        if ($reconciliation->status !== 'draft') {
            return response()->json(['error' => 'Only draft reconciliations can be deleted'], 400);
        }

        $reconciliation->delete();
        return response()->json(null, 204);
    }
}
