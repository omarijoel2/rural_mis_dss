<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\RfqItem;
use App\Models\Procurement\RfqInvitation;
use App\Models\Procurement\Bid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RfqController extends Controller
{
    /**
     * GET /api/v1/procurement/rfqs
     */
    public function index(Request $request)
    {
        $query = Rfq::with(['requisition', 'awardedVendor']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $rfqs = $query->withCount(['invitations', 'bids'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $rfqs->items(),
            'meta' => [
                'total' => $rfqs->total(),
                'per_page' => $rfqs->perPage(),
                'current_page' => $rfqs->currentPage(),
                'last_page' => $rfqs->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/procurement/rfqs
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'requisition_id' => 'nullable|uuid|exists:requisitions,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'issue_date' => 'required|date',
            'submission_deadline' => 'required|date|after:issue_date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit' => 'required|string',
            'items.*.specifications' => 'nullable|json',
            'vendor_ids' => 'nullable|array',
            'vendor_ids.*' => 'uuid|exists:vendors,id',
        ]);

        DB::beginTransaction();
        try {
            $rfq = Rfq::create([
                'tenant_id' => auth()->user()->tenant_id,
                'requisition_id' => $validated['requisition_id'] ?? null,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'issue_date' => $validated['issue_date'],
                'submission_deadline' => $validated['submission_deadline'],
                'status' => 'draft',
                'evaluation_criteria' => [
                    'price' => 50,
                    'quality' => 20,
                    'delivery' => 15,
                    'experience' => 15,
                ],
            ]);

            foreach ($validated['items'] as $itemData) {
                $rfq->items()->create($itemData);
            }

            if (!empty($validated['vendor_ids'])) {
                foreach ($validated['vendor_ids'] as $vendorId) {
                    RfqInvitation::create([
                        'rfq_id' => $rfq->id,
                        'vendor_id' => $vendorId,
                        'status' => 'invited',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'data' => $rfq->load('items', 'invitations'),
                'message' => 'RFQ created successfully.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/procurement/rfqs/{id}
     */
    public function show($id)
    {
        $rfq = Rfq::with(['requisition', 'items', 'invitations.vendor', 'bids.vendor', 'bids.evaluations'])
            ->findOrFail($id);

        return response()->json(['data' => $rfq]);
    }

    /**
     * POST /api/v1/procurement/rfqs/{id}/issue
     */
    public function issue($id)
    {
        $rfq = Rfq::findOrFail($id);

        if ($rfq->status !== 'draft') {
            return response()->json(['error' => 'RFQ already issued'], 422);
        }

        $rfq->update(['status' => 'issued']);

        return response()->json([
            'data' => $rfq,
            'message' => 'RFQ issued to vendors.',
        ]);
    }

    /**
     * POST /api/v1/procurement/rfqs/{id}/award
     */
    public function award(Request $request, $id)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|uuid|exists:vendors,id',
        ]);

        $rfq = Rfq::findOrFail($id);

        if (!in_array($rfq->status, ['evaluating', 'issued'])) {
            return response()->json(['error' => 'RFQ not in evaluating state'], 422);
        }

        $rfq->update([
            'status' => 'awarded',
            'awarded_vendor_id' => $validated['vendor_id'],
        ]);

        return response()->json([
            'data' => $rfq->load('awardedVendor'),
            'message' => 'RFQ awarded to vendor.',
        ]);
    }

    /**
     * GET /api/v1/procurement/rfqs/{id}/evaluation-matrix
     */
    public function evaluationMatrix($id)
    {
        $rfq = Rfq::with(['bids.vendor', 'bids.evaluations'])->findOrFail($id);

        $matrix = [];
        foreach ($rfq->bids as $bid) {
            $avgScores = [
                'price' => $bid->evaluations->avg('price_score') ?? 0,
                'quality' => $bid->evaluations->avg('quality_score') ?? 0,
                'delivery' => $bid->evaluations->avg('delivery_score') ?? 0,
                'experience' => $bid->evaluations->avg('experience_score') ?? 0,
            ];

            $weightedTotal = 0;
            foreach ($avgScores as $criterion => $score) {
                $weight = $rfq->evaluation_criteria[$criterion] ?? 0;
                $weightedTotal += ($score * $weight / 100);
            }

            $matrix[] = [
                'vendor_id' => $bid->vendor_id,
                'vendor_name' => $bid->vendor->name,
                'bid_amount' => $bid->total_bid_amount,
                'delivery_days' => $bid->delivery_days,
                'scores' => $avgScores,
                'weighted_total' => round($weightedTotal, 2),
                'rank' => 0,
            ];
        }

        usort($matrix, fn($a, $b) => $b['weighted_total'] <=> $a['weighted_total']);
        foreach ($matrix as $i => &$row) {
            $row['rank'] = $i + 1;
        }

        return response()->json(['data' => $matrix]);
    }
}
