<?php

namespace App\Services\Crm;

use App\Models\CrmInvoice;
use App\Models\CrmBalance;
use App\Models\CrmServiceConnection;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class DunningService
{
    public function getAgingReport(User $user): array
    {
        $tenantId = $user->currentTenantId();

        $balances = CrmBalance::where('tenant_id', $tenantId)
            ->whereRaw("(aging->>'over_90')::numeric > 0 OR (aging->>'90_days')::numeric > 0 OR (aging->>'60_days')::numeric > 0 OR (aging->>'30_days')::numeric > 0")
            ->orderByRaw("(aging->>'over_90')::numeric DESC")
            ->with('connection.customer')
            ->get();

        $summary = [
            'total_accounts' => $balances->count(),
            'total_balance' => $balances->sum('balance'),
            'buckets' => [
                'current' => 0,
                '30_days' => 0,
                '60_days' => 0,
                '90_days' => 0,
                'over_90' => 0,
            ],
        ];

        foreach ($balances as $balance) {
            $aging = $balance->aging;
            $summary['buckets']['current'] += $aging['current'] ?? 0;
            $summary['buckets']['30_days'] += $aging['30_days'] ?? 0;
            $summary['buckets']['60_days'] += $aging['60_days'] ?? 0;
            $summary['buckets']['90_days'] += $aging['90_days'] ?? 0;
            $summary['buckets']['over_90'] += $aging['over_90'] ?? 0;
        }

        return [
            'summary' => $summary,
            'accounts' => $balances,
        ];
    }

    public function getAccountsForDisconnection(User $user): Collection
    {
        $tenantId = $user->currentTenantId();

        $cutoffDate = Carbon::now()->subDays(90);

        $overdueInvoices = CrmInvoice::where('tenant_id', $tenantId)
            ->whereIn('status', ['open', 'part_paid'])
            ->where('due_date', '<', $cutoffDate)
            ->select('account_no')
            ->groupBy('account_no')
            ->havingRaw('SUM(total_amount) > ?', [500])
            ->pluck('account_no');

        return CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->whereIn('account_no', $overdueInvoices)
          ->where('status', 'active')
          ->with(['customer', 'premise', 'balances' => function($q) {
              $q->orderBy('as_of', 'desc')->limit(1);
          }])
          ->get();
    }

    public function generateDunningNotices(string $agingBucket, User $user): array
    {
        $tenantId = $user->currentTenantId();

        $balances = CrmBalance::where('tenant_id', $tenantId)
            ->whereRaw("(aging->>?)::numeric > 0", [$agingBucket])
            ->with('connection.customer')
            ->get();

        $notices = [];

        foreach ($balances as $balance) {
            $customer = $balance->connection->customer;
            $aging = $balance->aging;

            $amountDue = $aging[$agingBucket] ?? 0;

            if ($amountDue <= 0) {
                continue;
            }

            $template = $this->getNoticeTemplate($agingBucket);

            $notices[] = [
                'account_no' => $balance->account_no,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
                'customer_email' => $customer->email,
                'amount_due' => $amountDue,
                'total_balance' => $balance->balance,
                'aging_bucket' => $agingBucket,
                'template' => $template,
                'message' => str_replace(
                    ['{name}', '{amount}', '{account}'],
                    [$customer->name, number_format($amountDue, 2), $balance->account_no],
                    $template['message']
                ),
            ];
        }

        return $notices;
    }

    private function getNoticeTemplate(string $agingBucket): array
    {
        return match($agingBucket) {
            '30_days' => [
                'subject' => 'Payment Reminder - Account Overdue',
                'message' => 'Dear {name}, your account {account} has an overdue balance of KES {amount}. Please clear this amount within 7 days to avoid service disruption.',
                'severity' => 'reminder',
            ],
            '60_days' => [
                'subject' => 'Final Notice - Payment Required',
                'message' => 'Dear {name}, your account {account} has been overdue for 60 days with a balance of KES {amount}. This is your final notice before disconnection.',
                'severity' => 'warning',
            ],
            '90_days' => [
                'subject' => 'URGENT: Disconnection Notice',
                'message' => 'Dear {name}, your account {account} is severely overdue (90+ days) with a balance of KES {amount}. Service disconnection is imminent.',
                'severity' => 'urgent',
            ],
            'over_90' => [
                'subject' => 'CRITICAL: Account Under Legal Action',
                'message' => 'Dear {name}, your account {account} has been overdue for over 90 days with a balance of KES {amount}. Legal action may be initiated.',
                'severity' => 'critical',
            ],
            default => [
                'subject' => 'Payment Notice',
                'message' => 'Dear {name}, please clear your outstanding balance of KES {amount} for account {account}.',
                'severity' => 'info',
            ],
        };
    }

    public function markForDisconnection(string $accountNo, string $reason, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $accountNo)->firstOrFail();

        if ($connection->status === 'disconnected') {
            return false;
        }

        $connection->update([
            'status' => 'pending_disconnect',
            'meta' => array_merge($connection->meta ?? [], [
                'disconnect_reason' => $reason,
                'marked_at' => now(),
                'marked_by' => $user->id,
            ]),
        ]);

        return true;
    }

    public function disconnectAccount(string $accountNo, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $accountNo)->firstOrFail();

        $connection->update([
            'status' => 'disconnected',
            'disconnect_date' => now(),
            'meta' => array_merge($connection->meta ?? [], [
                'disconnected_by' => $user->id,
                'disconnected_at' => now(),
            ]),
        ]);

        return true;
    }

    public function reconnectAccount(string $accountNo, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $accountNo)->firstOrFail();

        $balance = $connection->balances()->orderBy('as_of', 'desc')->first();

        if ($balance && $balance->balance > 0) {
            throw new \Exception("Cannot reconnect account with outstanding balance: KES " . number_format($balance->balance, 2));
        }

        $connection->update([
            'status' => 'active',
            'disconnect_date' => null,
            'meta' => array_merge($connection->meta ?? [], [
                'reconnected_by' => $user->id,
                'reconnected_at' => now(),
            ]),
        ]);

        return true;
    }
}
