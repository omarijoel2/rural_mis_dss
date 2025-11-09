<?php

namespace App\Services\Crm;

use App\Models\CrmServiceConnection;
use App\Models\CrmCustomer;
use App\Models\CrmPremise;
use App\Models\CrmRaCase;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class Account360Service
{
    public function getAccountOverview(string $accountNo, User $user): array
    {
        $tenantId = $user->currentTenantId();

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $accountNo)
          ->with(['premise', 'customer', 'meters'])
          ->firstOrFail();

        $latestBalance = $connection->balances()
            ->orderBy('as_of', 'desc')
            ->first();

        $recentInvoices = $connection->invoices()
            ->orderBy('period_start', 'desc')
            ->limit(6)
            ->get();

        $recentPayments = $connection->payments()
            ->orderBy('paid_at', 'desc')
            ->limit(10)
            ->get();

        $latestMeter = $connection->meters()
            ->orderBy('install_date', 'desc')
            ->first();

        $recentReads = $latestMeter ? $latestMeter->reads()
            ->orderBy('read_at', 'desc')
            ->limit(12)
            ->get() : collect();

        $activeCases = CrmRaCase::where('tenant_id', $tenantId)
            ->where('account_no', $accountNo)
            ->whereIn('status', ['new', 'triage', 'field'])
            ->count();

        $openComplaints = $connection->premise->complaints()
            ->whereIn('status', ['open', 'triage', 'field'])
            ->count();

        return [
            'connection' => $connection,
            'customer' => $connection->customer,
            'premise' => $connection->premise,
            'balance' => $latestBalance,
            'recent_invoices' => $recentInvoices,
            'recent_payments' => $recentPayments,
            'latest_meter' => $latestMeter,
            'recent_reads' => $recentReads,
            'active_cases_count' => $activeCases,
            'open_complaints_count' => $openComplaints,
        ];
    }

    public function getBillingHistory(string $accountNo, int $months, User $user): array
    {
        $tenantId = $user->currentTenantId();

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $accountNo)->firstOrFail();

        $startDate = Carbon::now()->subMonths($months);

        $invoices = $connection->invoices()
            ->where('period_start', '>=', $startDate)
            ->orderBy('period_start', 'desc')
            ->with('lines')
            ->get();

        $payments = $connection->payments()
            ->where('paid_at', '>=', $startDate)
            ->orderBy('paid_at', 'desc')
            ->get();

        $balanceHistory = $connection->balances()
            ->where('as_of', '>=', $startDate)
            ->orderBy('as_of', 'asc')
            ->get();

        return [
            'invoices' => $invoices,
            'payments' => $payments,
            'balance_history' => $balanceHistory,
        ];
    }

    public function getConsumptionAnalytics(string $accountNo, int $months, User $user): array
    {
        $tenantId = $user->currentTenantId();

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->where('account_no', $accountNo)->firstOrFail();

        $latestMeter = $connection->meters()->orderBy('install_date', 'desc')->first();

        if (!$latestMeter) {
            return [
                'consumption' => [],
                'average' => 0,
                'trend' => 'insufficient_data',
            ];
        }

        $startDate = Carbon::now()->subMonths($months);

        $reads = $latestMeter->reads()
            ->where('read_at', '>=', $startDate)
            ->where('quality', 'good')
            ->orderBy('read_at', 'asc')
            ->get();

        $consumption = [];
        $total = 0;
        $count = 0;

        for ($i = 1; $i < $reads->count(); $i++) {
            $prev = $reads[$i - 1];
            $curr = $reads[$i];
            $consumed = $curr->value - $prev->value;

            if ($consumed > 0) {
                $consumption[] = [
                    'period_start' => $prev->read_at,
                    'period_end' => $curr->read_at,
                    'consumption' => $consumed,
                ];
                $total += $consumed;
                $count++;
            }
        }

        $average = $count > 0 ? $total / $count : 0;

        $trend = $count >= 3 ? $this->calculateTrend($consumption) : 'insufficient_data';

        return [
            'consumption' => $consumption,
            'average' => round($average, 2),
            'trend' => $trend,
        ];
    }

    private function calculateTrend(array $consumption): string
    {
        if (count($consumption) < 3) {
            return 'insufficient_data';
        }

        $recent = array_slice($consumption, -3);
        $values = array_map(fn($c) => $c['consumption'], $recent);

        $isIncreasing = $values[2] > $values[0];
        $change = abs($values[2] - $values[0]) / $values[0] * 100;

        if ($change < 10) {
            return 'stable';
        }

        return $isIncreasing ? 'increasing' : 'decreasing';
    }
}
