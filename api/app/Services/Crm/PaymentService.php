<?php

namespace App\Services\Crm;

use App\Models\CrmPayment;
use App\Models\CrmInvoice;
use App\Models\CrmBalance;
use App\Models\CrmServiceConnection;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class PaymentService
{
    public function recordPayment(array $data, User $user): CrmPayment
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'account_no' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0.01',
            'paid_at' => 'required|date',
            'channel' => 'required|in:cash,bank,mpesa,online,adjustment',
            'ref' => 'nullable|string|max:100',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $data['account_no'])->firstOrFail();

        return DB::transaction(function () use ($data, $tenantId) {
            $payment = CrmPayment::create([
                'tenant_id' => $tenantId,
                'account_no' => $data['account_no'],
                'paid_at' => $data['paid_at'],
                'amount' => $data['amount'],
                'channel' => $data['channel'],
                'ref' => $data['ref'] ?? null,
                'meta' => $data['meta'] ?? null,
            ]);

            $this->allocatePaymentToInvoices($payment);
            $this->updateBalance($data['account_no'], $tenantId);

            return $payment;
        });
    }

    private function allocatePaymentToInvoices(CrmPayment $payment): void
    {
        $remainingAmount = $payment->amount;

        $openInvoices = CrmInvoice::where('tenant_id', $payment->tenant_id)
            ->where('account_no', $payment->account_no)
            ->whereIn('status', ['open', 'part_paid'])
            ->orderBy('due_date', 'asc')
            ->get();

        foreach ($openInvoices as $invoice) {
            if ($remainingAmount <= 0) {
                break;
            }

            $paidBefore = CrmPayment::where('account_no', $invoice->account_no)
                ->where('paid_at', '<=', $payment->paid_at)
                ->where('id', '!=', $payment->id)
                ->sum('amount');

            $invoiceBalance = $invoice->total_amount - $paidBefore;

            if ($invoiceBalance <= 0) {
                $invoice->update(['status' => 'paid']);
                continue;
            }

            if ($remainingAmount >= $invoiceBalance) {
                $invoice->update(['status' => 'paid']);
                $remainingAmount -= $invoiceBalance;
            } else {
                $invoice->update(['status' => 'part_paid']);
                $remainingAmount = 0;
            }
        }
    }

    private function updateBalance(string $accountNo, string $tenantId): void
    {
        $totalInvoiced = CrmInvoice::where('tenant_id', $tenantId)
            ->where('account_no', $accountNo)
            ->sum('total_amount');

        $totalPaid = CrmPayment::where('tenant_id', $tenantId)
            ->where('account_no', $accountNo)
            ->sum('amount');

        $balance = $totalInvoiced - $totalPaid;

        $aging = $this->calculateAging($accountNo, $tenantId);

        CrmBalance::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'account_no' => $accountNo,
                'as_of' => Carbon::now()->toDateString(),
            ],
            [
                'balance' => $balance,
                'aging' => $aging,
            ]
        );
    }

    private function calculateAging(string $accountNo, string $tenantId): array
    {
        $openInvoices = CrmInvoice::where('tenant_id', $tenantId)
            ->where('account_no', $accountNo)
            ->whereIn('status', ['open', 'part_paid'])
            ->get();

        $aging = [
            'current' => 0,
            '30_days' => 0,
            '60_days' => 0,
            '90_days' => 0,
            'over_90' => 0,
        ];

        $now = Carbon::now();

        foreach ($openInvoices as $invoice) {
            $paidAmount = CrmPayment::where('account_no', $invoice->account_no)
                ->where('paid_at', '<=', $now)
                ->sum('amount');

            $balance = $invoice->total_amount - $paidAmount;

            if ($balance <= 0) {
                continue;
            }

            $daysOverdue = Carbon::parse($invoice->due_date)->diffInDays($now, false);

            if ($daysOverdue < 0) {
                $aging['current'] += $balance;
            } elseif ($daysOverdue < 30) {
                $aging['30_days'] += $balance;
            } elseif ($daysOverdue < 60) {
                $aging['60_days'] += $balance;
            } elseif ($daysOverdue < 90) {
                $aging['90_days'] += $balance;
            } else {
                $aging['over_90'] += $balance;
            }
        }

        return $aging;
    }

    public function reversePayment(int $paymentId, string $reason, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $payment = CrmPayment::where('tenant_id', $tenantId)->findOrFail($paymentId);

        return DB::transaction(function () use ($payment, $reason, $tenantId) {
            $reversal = CrmPayment::create([
                'tenant_id' => $tenantId,
                'account_no' => $payment->account_no,
                'paid_at' => now(),
                'amount' => -$payment->amount,
                'channel' => 'adjustment',
                'ref' => "REVERSAL:{$payment->id}",
                'meta' => [
                    'reason' => $reason,
                    'original_payment_id' => $payment->id,
                ],
            ]);

            $this->allocatePaymentToInvoices($reversal);
            $this->updateBalance($payment->account_no, $tenantId);

            return true;
        });
    }

    public function getPaymentHistory(string $accountNo, int $months, User $user)
    {
        $tenantId = $user->currentTenantId();

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $accountNo)->firstOrFail();

        $startDate = Carbon::now()->subMonths($months);

        return CrmPayment::where('tenant_id', $tenantId)
            ->where('account_no', $accountNo)
            ->where('paid_at', '>=', $startDate)
            ->orderBy('paid_at', 'desc')
            ->get();
    }
}
