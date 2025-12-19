<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmPayment;
use App\Models\CrmInvoice;
use App\Models\CrmBalance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentReconciliationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $query = CrmPayment::query();
        
        if ($request->has('channel')) {
            $query->where('channel', $request->input('channel'));
        }
        
        if ($request->has('date_from')) {
            $query->where('paid_at', '>=', $request->input('date_from'));
        }
        
        if ($request->has('date_to')) {
            $query->where('paid_at', '<=', $request->input('date_to'));
        }
        
        if ($request->has('status')) {
            // Status based on whether payment has matching invoice
            if ($request->input('status') === 'reconciled') {
                $query->whereHas('connection.invoices');
            } elseif ($request->input('status') === 'unreconciled') {
                $query->whereDoesntHave('connection.invoices');
            }
        }
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('account_no', 'like', "%{$search}%")
                  ->orWhere('ref', 'like', "%{$search}%");
            });
        }
        
        $query->with('connection.customer')
            ->orderBy('paid_at', 'desc');
        
        return response()->json($query->paginate($perPage));
    }

    public function reconcile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => 'required|exists:crm_payments,id',
            'invoice_ids' => 'required|array',
            'invoice_ids.*' => 'exists:crm_invoices,id',
        ]);

        DB::beginTransaction();
        try {
            $payment = CrmPayment::findOrFail($validated['payment_id']);
            $invoices = CrmInvoice::whereIn('id', $validated['invoice_ids'])->get();

            $totalInvoiceAmount = $invoices->sum('total_amount');
            $remainingPayment = $payment->amount;

            foreach ($invoices as $invoice) {
                if ($remainingPayment <= 0) break;

                $allocationAmount = min($remainingPayment, $invoice->total_amount);
                
                // Update invoice status
                if ($allocationAmount >= $invoice->total_amount) {
                    $invoice->status = 'paid';
                } else {
                    $invoice->status = 'partial';
                }
                $invoice->save();

                $remainingPayment -= $allocationAmount;
            }

            // Update balance
            $this->updateBalance($payment->account_no);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment reconciled successfully',
                'reconciled_amount' => $payment->amount - $remainingPayment,
                'remaining_amount' => $remainingPayment,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Reconciliation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function aging(Request $request): JsonResponse
    {
        $balances = CrmBalance::with('connection.customer')
            ->where('balance', '>', 0)
            ->get();

        $summary = [
            'total_accounts' => $balances->count(),
            'total_balance' => $balances->sum('balance'),
            'current' => $balances->sum('current'),
            'days_30' => $balances->sum('days_30'),
            'days_60' => $balances->sum('days_60'),
            'days_90' => $balances->sum('days_90'),
            'over_90' => $balances->sum('over_90'),
        ];

        $dso = $this->calculateDSO();

        $topDebtors = $balances->sortByDesc('balance')
            ->take(10)
            ->map(function($balance) {
                return [
                    'account_no' => $balance->connection->account_no ?? 'N/A',
                    'customer_name' => optional($balance->connection->customer)->first_name . ' ' . optional($balance->connection->customer)->last_name,
                    'balance' => $balance->balance,
                    'days_30' => $balance->days_30,
                    'days_60' => $balance->days_60,
                    'days_90' => $balance->days_90,
                    'over_90' => $balance->over_90,
                    'last_payment_date' => $balance->updated_at,
                ];
            })
            ->values();

        return response()->json([
            'summary' => $summary,
            'dso' => $dso,
            'top_debtors' => $topDebtors,
            'aging_buckets' => [
                ['bucket' => 'Current', 'amount' => $summary['current']],
                ['bucket' => '30 Days', 'amount' => $summary['days_30']],
                ['bucket' => '60 Days', 'amount' => $summary['days_60']],
                ['bucket' => '90 Days', 'amount' => $summary['days_90']],
                ['bucket' => '90+ Days', 'amount' => $summary['over_90']],
            ],
        ]);
    }

    private function updateBalance(string $accountNo): void
    {
        $invoices = CrmInvoice::where('account_no', $accountNo)
            ->where('status', '!=', 'paid')
            ->get();

        $payments = CrmPayment::where('account_no', $accountNo)->sum('amount');
        $totalInvoiced = CrmInvoice::where('account_no', $accountNo)->sum('total_amount');

        $balance = $totalInvoiced - $payments;

        $aging = [
            'current' => 0,
            'days_30' => 0,
            'days_60' => 0,
            'days_90' => 0,
            'over_90' => 0,
        ];

        foreach ($invoices as $invoice) {
            $daysOverdue = now()->diffInDays($invoice->due_date);
            
            if ($daysOverdue < 30) {
                $aging['current'] += $invoice->total_amount;
            } elseif ($daysOverdue < 60) {
                $aging['days_30'] += $invoice->total_amount;
            } elseif ($daysOverdue < 90) {
                $aging['days_60'] += $invoice->total_amount;
            } elseif ($daysOverdue < 120) {
                $aging['days_90'] += $invoice->total_amount;
            } else {
                $aging['over_90'] += $invoice->total_amount;
            }
        }

        CrmBalance::updateOrCreate(
            ['connection_id' => CrmInvoice::where('account_no', $accountNo)->first()?->connection_id],
            array_merge(['balance' => $balance], $aging)
        );
    }

    private function calculateDSO(): float
    {
        $totalReceivables = CrmBalance::sum('balance');
        $totalRevenue = CrmInvoice::whereDate('created_at', '>=', now()->subDays(90))->sum('total_amount');
        
        if ($totalRevenue == 0) return 0;
        
        return round(($totalReceivables / $totalRevenue) * 90, 2);
    }
}
