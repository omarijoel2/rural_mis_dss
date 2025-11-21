<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Procurement\Lpo;
use App\Models\Procurement\LpoItem;
use App\Models\Procurement\Rfq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LpoController extends Controller
{
    /**
     * GET /api/v1/procurement/lpos
     */
    public function index(Request $request)
    {
        $query = Lpo::with(['vendor', 'rfq', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $lpos = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $lpos->items(),
            'meta' => [
                'total' => $lpos->total(),
                'per_page' => $lpos->perPage(),
                'current_page' => $lpos->currentPage(),
                'last_page' => $lpos->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/procurement/lpos
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rfq_id' => 'nullable|uuid|exists:rfqs,id',
            'vendor_id' => 'required|uuid|exists:vendors,id',
            'order_date' => 'required|date',
            'delivery_date' => 'nullable|date|after:order_date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit' => 'required|string',
            'items.*.unit_price' => 'required|numeric|min:0',
            'terms_conditions' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $lpo = Lpo::create([
                'tenant_id' => auth()->user()->tenant_id,
                'rfq_id' => $validated['rfq_id'] ?? null,
                'vendor_id' => $validated['vendor_id'],
                'order_date' => $validated['order_date'],
                'delivery_date' => $validated['delivery_date'] ?? null,
                'total_amount' => $totalAmount,
                'terms_conditions' => $validated['terms_conditions'] ?? null,
                'status' => 'draft',
            ]);

            foreach ($validated['items'] as $itemData) {
                $itemData['total_price'] = $itemData['quantity'] * $itemData['unit_price'];
                $lpo->items()->create($itemData);
            }

            DB::commit();

            return response()->json([
                'data' => $lpo->load('items', 'vendor'),
                'message' => 'LPO created successfully.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/v1/procurement/lpos/generate-from-rfq
     * Generate LPO from awarded RFQ
     */
    public function generateFromRfq(Request $request)
    {
        $validated = $request->validate([
            'rfq_id' => 'required|uuid|exists:rfqs,id',
            'delivery_date' => 'required|date',
            'terms_conditions' => 'nullable|string',
        ]);

        $rfq = Rfq::with(['items', 'bids' => function ($q) {
            $q->with('items.rfqItem');
        }])->findOrFail($validated['rfq_id']);

        if ($rfq->status !== 'awarded' || !$rfq->awarded_vendor_id) {
            return response()->json(['error' => 'RFQ not awarded to a vendor'], 422);
        }

        $winningBid = $rfq->bids()->where('vendor_id', $rfq->awarded_vendor_id)->first();
        if (!$winningBid) {
            return response()->json(['error' => 'Winning bid not found'], 404);
        }

        DB::beginTransaction();
        try {
            $lpo = Lpo::create([
                'tenant_id' => auth()->user()->tenant_id,
                'rfq_id' => $rfq->id,
                'vendor_id' => $rfq->awarded_vendor_id,
                'order_date' => now(),
                'delivery_date' => $validated['delivery_date'],
                'total_amount' => $winningBid->total_bid_amount,
                'terms_conditions' => $validated['terms_conditions'] ?? 'Standard payment terms: Net 30 days',
                'status' => 'draft',
            ]);

            foreach ($winningBid->items as $bidItem) {
                $lpo->items()->create([
                    'description' => $bidItem->rfqItem->description,
                    'quantity' => $bidItem->rfqItem->quantity,
                    'unit' => $bidItem->rfqItem->unit,
                    'unit_price' => $bidItem->unit_price,
                    'total_price' => $bidItem->total_price,
                ]);
            }

            DB::commit();

            return response()->json([
                'data' => $lpo->load('items', 'vendor'),
                'message' => 'LPO generated from RFQ successfully.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/procurement/lpos/{id}
     */
    public function show($id)
    {
        $lpo = Lpo::with(['vendor', 'rfq', 'items', 'approver'])
            ->findOrFail($id);

        return response()->json(['data' => $lpo]);
    }

    /**
     * POST /api/v1/procurement/lpos/{id}/approve
     */
    public function approve($id)
    {
        $lpo = Lpo::findOrFail($id);

        if ($lpo->status !== 'draft') {
            return response()->json(['error' => 'LPO already processed'], 422);
        }

        $lpo->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'data' => $lpo,
            'message' => 'LPO approved successfully.',
        ]);
    }

    /**
     * POST /api/v1/procurement/lpos/{id}/issue
     */
    public function issue($id)
    {
        $lpo = Lpo::findOrFail($id);

        if ($lpo->status !== 'approved') {
            return response()->json(['error' => 'LPO must be approved first'], 422);
        }

        $lpo->update(['status' => 'issued']);

        return response()->json([
            'data' => $lpo,
            'message' => 'LPO issued to vendor.',
        ]);
    }
}
