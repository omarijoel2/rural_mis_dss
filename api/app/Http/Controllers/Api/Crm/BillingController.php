<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmInvoice;
use App\Models\CrmInvoiceLine;
use App\Models\CrmServiceConnection;
use App\Models\CrmCustomerRead;
use App\Models\CrmTariff;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function runs(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        // Get unique billing periods
        $runs = CrmInvoice::select(
                DB::raw("TO_CHAR(period_start, 'YYYY-MM') as period"),
                DB::raw("MIN(period_start) as period_start"),
                DB::raw("MAX(period_end) as period_end"),
                DB::raw("COUNT(*) as invoice_count"),
                DB::raw("SUM(total_amount) as total_amount"),
                DB::raw("MIN(created_at) as created_at")
            )
            ->groupBy(DB::raw("TO_CHAR(period_start, 'YYYY-MM')"))
            ->orderBy('period_start', 'desc')
            ->paginate($perPage);

        return response()->json($runs);
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'segment' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $connections = CrmServiceConnection::with(['customer', 'premise', 'tariff'])
            ->where('status', 'active')
            ->when($validated['segment'] ?? null, function($q, $segment) {
                $q->whereHas('customer', function($query) use ($segment) {
                    $query->where('customer_type', $segment);
                });
            })
            ->limit($validated['limit'] ?? 10)
            ->get();

        $preview = $connections->map(function($connection) use ($validated) {
            // Get latest meter read
            $latestRead = $connection->meters()
                ->with('reads')
                ->first()?->reads()
                ->whereBetween('read_at', [$validated['period_start'], $validated['period_end']])
                ->orderBy('read_at', 'desc')
                ->first();

            $consumption = $latestRead ? ($latestRead->reading - ($latestRead->previous_reading ?? 0)) : 0;
            
            $estimatedCharge = $this->calculateCharge($connection->tariff, $consumption);

            return [
                'account_no' => $connection->account_no,
                'customer_name' => $connection->customer->first_name . ' ' . $connection->customer->last_name,
                'consumption' => $consumption,
                'estimated_charge' => $estimatedCharge,
                'tariff' => $connection->tariff->name,
            ];
        });

        return response()->json([
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'preview_count' => $preview->count(),
            'total_estimated' => $preview->sum('estimated_charge'),
            'accounts' => $preview,
        ]);
    }

    public function execute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'due_date' => 'required|date|after:period_end',
            'segment' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $connections = CrmServiceConnection::with(['customer', 'premise', 'tariff', 'meters.reads'])
                ->where('status', 'active')
                ->when($validated['segment'] ?? null, function($q, $segment) {
                    $q->whereHas('customer', function($query) use ($segment) {
                        $query->where('customer_type', $segment);
                    });
                })
                ->get();

            $invoicesCreated = 0;
            $totalAmount = 0;

            foreach ($connections as $connection) {
                $latestRead = $connection->meters->first()?->reads()
                    ->whereBetween('read_at', [$validated['period_start'], $validated['period_end']])
                    ->orderBy('read_at', 'desc')
                    ->first();

                $consumption = $latestRead ? ($latestRead->reading - ($latestRead->previous_reading ?? 0)) : 0;
                $charge = $this->calculateCharge($connection->tariff, $consumption);

                $invoice = CrmInvoice::create([
                    'tenant_id' => auth()->user()->currentTenantId(),
                    'account_no' => $connection->account_no,
                    'period_start' => $validated['period_start'],
                    'period_end' => $validated['period_end'],
                    'due_date' => $validated['due_date'],
                    'total_amount' => $charge,
                    'status' => 'issued',
                    'meta' => [
                        'consumption' => $consumption,
                        'tariff_id' => $connection->tariff_id,
                        'meter_read_id' => $latestRead?->id,
                    ],
                ]);

                CrmInvoiceLine::create([
                    'invoice_id' => $invoice->id,
                    'description' => "Water consumption for period",
                    'quantity' => $consumption,
                    'unit_price' => $connection->tariff->blocks[0]['rate'] ?? 0,
                    'amount' => $charge,
                ]);

                $invoicesCreated++;
                $totalAmount += $charge;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'invoices_created' => $invoicesCreated,
                'total_amount' => $totalAmount,
                'period' => $validated['period_start'] . ' to ' . $validated['period_end'],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Billing run failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function calculateCharge($tariff, float $consumption): float
    {
        if (!$tariff) return 0;
        
        $totalCharge = $tariff->fixed_charge ?? 0;
        $blocks = $tariff->blocks;
        $remainingConsumption = $consumption;

        foreach ($blocks as $block) {
            if ($remainingConsumption <= 0) break;

            $blockMin = $block['min'];
            $blockMax = $block['max'] ?? PHP_FLOAT_MAX;
            $blockRate = $block['rate'];

            $blockSize = $blockMax - $blockMin;
            $consumedInBlock = min($remainingConsumption, $blockSize);

            $totalCharge += $consumedInBlock * $blockRate;
            $remainingConsumption -= $consumedInBlock;
        }

        return round($totalCharge, 2);
    }
}
