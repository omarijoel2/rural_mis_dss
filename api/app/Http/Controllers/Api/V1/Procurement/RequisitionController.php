<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Procurement\Requisition;
use App\Models\Procurement\RequisitionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequisitionController extends Controller
{
    /**
     * GET /api/v1/procurement/requisitions
     */
    public function index(Request $request)
    {
        $query = Requisition::with(['requestor', 'approver', 'items']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $requisitions = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $requisitions->items(),
            'meta' => [
                'total' => $requisitions->total(),
                'per_page' => $requisitions->perPage(),
                'current_page' => $requisitions->currentPage(),
                'last_page' => $requisitions->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/procurement/requisitions
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'required_date' => 'nullable|date',
            'justification' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit' => 'required|string',
            'items.*.unit_cost_estimate' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $totalEstimate = 0;
            foreach ($validated['items'] as $item) {
                $totalEstimate += $item['quantity'] * $item['unit_cost_estimate'];
            }

            $requisition = Requisition::create([
                'tenant_id' => auth()->user()->tenant_id,
                'requestor_id' => auth()->id(),
                'required_date' => $validated['required_date'] ?? null,
                'justification' => $validated['justification'],
                'status' => 'draft',
                'total_estimate' => $totalEstimate,
            ]);

            foreach ($validated['items'] as $itemData) {
                $itemData['total_estimate'] = $itemData['quantity'] * $itemData['unit_cost_estimate'];
                $requisition->items()->create($itemData);
            }

            DB::commit();

            return response()->json([
                'data' => $requisition->load('items'),
                'message' => 'Requisition created successfully.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/procurement/requisitions/{id}
     */
    public function show($id)
    {
        $requisition = Requisition::with(['requestor', 'approver', 'items'])
            ->findOrFail($id);

        return response()->json(['data' => $requisition]);
    }

    /**
     * PATCH /api/v1/procurement/requisitions/{id}
     */
    public function update(Request $request, $id)
    {
        $requisition = Requisition::findOrFail($id);

        if (!in_array($requisition->status, ['draft'])) {
            return response()->json(['error' => 'Cannot edit submitted requisition'], 422);
        }

        $validated = $request->validate([
            'required_date' => 'nullable|date',
            'justification' => 'string',
        ]);

        $requisition->update($validated);

        return response()->json([
            'data' => $requisition,
            'message' => 'Requisition updated successfully.',
        ]);
    }

    /**
     * POST /api/v1/procurement/requisitions/{id}/submit
     */
    public function submit($id)
    {
        $requisition = Requisition::findOrFail($id);

        if ($requisition->status !== 'draft') {
            return response()->json(['error' => 'Requisition already submitted'], 422);
        }

        $requisition->update(['status' => 'submitted']);

        return response()->json([
            'data' => $requisition,
            'message' => 'Requisition submitted for approval.',
        ]);
    }

    /**
     * POST /api/v1/procurement/requisitions/{id}/approve
     */
    public function approve($id)
    {
        $requisition = Requisition::findOrFail($id);

        if ($requisition->status !== 'submitted') {
            return response()->json(['error' => 'Requisition not in submitted state'], 422);
        }

        $requisition->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'data' => $requisition,
            'message' => 'Requisition approved successfully.',
        ]);
    }

    /**
     * POST /api/v1/procurement/requisitions/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $requisition = Requisition::findOrFail($id);

        $requisition->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'data' => $requisition,
            'message' => 'Requisition rejected.',
        ]);
    }
}
