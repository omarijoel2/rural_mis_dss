<?php

namespace App\Services\Cmms;

use App\Models\ServiceContract;
use App\Models\VendorScorecard;
use App\Models\SlaViolation;
use App\Models\ContractPayment;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ContractorService
{
    public function getAllContracts(array $filters = []): Collection
    {
        $query = ServiceContract::query();
        
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (isset($filters['vendor_name'])) {
            $query->where('vendor_name', 'ilike', "%{$filters['vendor_name']}%");
        }
        
        return $query->orderBy('start_date', 'desc')->get();
    }

    public function getContract(int $id): ServiceContract
    {
        return ServiceContract::with(['violations', 'payments'])->findOrFail($id);
    }

    public function createContract(array $data): ServiceContract
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['contract_num'] = $data['contract_num'] ?? $this->generateContractNumber();
        
        return ServiceContract::create($data);
    }

    public function updateContract(int $id, array $data): ServiceContract
    {
        $contract = ServiceContract::findOrFail($id);
        $contract->update($data);
        return $contract->fresh();
    }

    public function recordViolation(int $contractId, array $data): SlaViolation
    {
        $data['service_contract_id'] = $contractId;
        
        return SlaViolation::create($data);
    }

    public function recordPayment(int $contractId, array $data): ContractPayment
    {
        return DB::transaction(function () use ($contractId, $data) {
            $contract = ServiceContract::findOrFail($contractId);
            
            $data['service_contract_id'] = $contractId;
            
            $payment = ContractPayment::create($data);
            
            $totalPaid = $contract->payments()->sum('amount');
            $contract->update(['paid_to_date' => $totalPaid]);
            
            return $payment;
        });
    }

    public function calculateVendorScore(string $vendorName, string $fromDate, string $toDate): VendorScorecard
    {
        $tenantId = auth()->user()->tenant_id;
        
        $contracts = ServiceContract::where('tenant_id', $tenantId)
            ->where('vendor_name', $vendorName)
            ->whereBetween('start_date', [$fromDate, $toDate])
            ->get();
        
        $workOrders = DB::table('work_orders')
            ->join('service_contracts', 'work_orders.service_contract_id', '=', 'service_contracts.id')
            ->where('service_contracts.vendor_name', $vendorName)
            ->whereBetween('work_orders.created_at', [$fromDate, $toDate])
            ->select('work_orders.*')
            ->get();
        
        $totalWo = $workOrders->count();
        $completedWo = $workOrders->where('status', 'completed')->count();
        $onTimeWo = $workOrders->filter(function ($wo) {
            return $wo->status === 'completed' && 
                   $wo->completed_at && 
                   $wo->scheduled_for &&
                   Carbon::parse($wo->completed_at)->lte(Carbon::parse($wo->scheduled_for));
        })->count();
        
        $violations = SlaViolation::whereIn('service_contract_id', $contracts->pluck('id'))
            ->whereBetween('occurred_at', [$fromDate, $toDate])
            ->get();
        
        $qualityScore = $totalWo > 0 ? ($completedWo / $totalWo) * 40 : 0;
        $timelinessScore = $totalWo > 0 ? ($onTimeWo / $totalWo) * 40 : 0;
        $complianceScore = max(0, 20 - ($violations->count() * 2));
        
        $overallScore = round($qualityScore + $timelinessScore + $complianceScore, 2);
        
        return VendorScorecard::create([
            'tenant_id' => $tenantId,
            'vendor_name' => $vendorName,
            'period_start' => $fromDate,
            'period_end' => $toDate,
            'work_orders_completed' => $completedWo,
            'work_orders_on_time' => $onTimeWo,
            'sla_violations' => $violations->count(),
            'quality_score' => round($qualityScore, 2),
            'timeliness_score' => round($timelinessScore, 2),
            'compliance_score' => round($complianceScore, 2),
            'overall_score' => $overallScore
        ]);
    }

    public function getActiveContracts(): Collection
    {
        return ServiceContract::where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('vendor_name')
            ->get();
    }

    public function getExpiringContracts(int $daysAhead = 30): Collection
    {
        $endDate = Carbon::now()->addDays($daysAhead);
        
        return ServiceContract::where('status', 'active')
            ->whereBetween('end_date', [now(), $endDate])
            ->orderBy('end_date')
            ->get();
    }

    protected function generateContractNumber(): string
    {
        $prefix = 'SC';
        $year = now()->format('y');
        $last = ServiceContract::where('contract_num', 'like', "{$prefix}{$year}%")
            ->orderBy('contract_num', 'desc')
            ->first();
        
        if ($last && preg_match("/{$prefix}{$year}(\d{4})/", $last->contract_num, $matches)) {
            $sequence = intval($matches[1]) + 1;
        } else {
            $sequence = 1;
        }
        
        return sprintf('%s%s%04d', $prefix, $year, $sequence);
    }
}
