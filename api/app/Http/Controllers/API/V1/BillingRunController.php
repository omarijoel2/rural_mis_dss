<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\BillingRun;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BillingRunController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BillingRun::with(['scheme', 'runBy']);

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        $runs = $query->orderBy('period_start', 'desc')->paginate($request->per_page ?? 25);

        $data = $runs->map(function ($run) {
            return [
                'id' => $run->id,
                'run_code' => $run->run_code,
                'period' => $run->period_start->format('Y-m'),
                'period_start' => $run->period_start->toDateString(),
                'period_end' => $run->period_end->toDateString(),
                'status' => $run->status,
                'invoice_count' => $run->invoices_generated,
                'accounts_processed' => $run->accounts_processed,
                'total_amount' => (float) $run->total_billed,
                'scheme' => $run->scheme?->name,
                'run_by' => $run->runBy?->name,
                'started_at' => $run->started_at?->toIso8601String(),
                'completed_at' => $run->completed_at?->toIso8601String(),
                'created_at' => $run->created_at->toDateString(),
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $runs->currentPage(),
                'last_page' => $runs->lastPage(),
                'per_page' => $runs->perPage(),
                'total' => $runs->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;
        $validated['run_code'] = 'BR-' . now()->format('YmdHis');
        $validated['status'] = 'draft';
        $validated['run_by'] = $request->user()->id;

        $run = BillingRun::create($validated);

        return response()->json(['data' => $run], 201);
    }

    public function show(BillingRun $billingRun): JsonResponse
    {
        $billingRun->load(['scheme', 'runBy']);
        return response()->json(['data' => $billingRun]);
    }

    public function start(BillingRun $billingRun): JsonResponse
    {
        if ($billingRun->status !== 'draft') {
            return response()->json(['error' => 'Only draft runs can be started'], 400);
        }

        $billingRun->update([
            'status' => 'running',
            'started_at' => now(),
        ]);

        return response()->json(['data' => $billingRun]);
    }

    public function complete(Request $request, BillingRun $billingRun): JsonResponse
    {
        if ($billingRun->status !== 'running') {
            return response()->json(['error' => 'Only running runs can be completed'], 400);
        }

        $billingRun->update([
            'status' => 'completed',
            'completed_at' => now(),
            'accounts_processed' => $request->accounts_processed ?? 0,
            'invoices_generated' => $request->invoices_generated ?? 0,
            'total_billed' => $request->total_billed ?? 0,
        ]);

        return response()->json(['data' => $billingRun]);
    }

    public function destroy(BillingRun $billingRun): JsonResponse
    {
        if ($billingRun->status !== 'draft') {
            return response()->json(['error' => 'Only draft runs can be deleted'], 400);
        }

        $billingRun->delete();
        return response()->json(null, 204);
    }
}
