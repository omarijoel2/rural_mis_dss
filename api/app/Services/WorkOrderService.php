<?php

namespace App\Services;

use App\Models\WorkOrder;
use App\Models\WoPart;
use App\Models\WoLabor;
use App\Models\Asset;
use App\Models\PmPolicy;
use App\Models\StockTxn;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class WorkOrderService
{
    public function createWorkOrder(array $data): WorkOrder
    {
        $data['status'] = $data['status'] ?? 'new';
        $data['created_by'] = $data['created_by'] ?? auth()->id();
        
        if (!isset($data['wo_num'])) {
            $data['wo_num'] = $this->generateWorkOrderNumber();
        }
        
        return WorkOrder::create($data);
    }

    public function createFromPmPolicy(string $pmPolicyId, \DateTime $scheduledFor): WorkOrder
    {
        $policy = PmPolicy::with('asset')->findOrFail($pmPolicyId);
        
        return $this->createWorkOrder([
            'wo_num' => $this->generateWorkOrderNumber(),
            'kind' => 'pm',
            'asset_id' => $policy->asset_id,
            'title' => "PM: {$policy->asset->name} - {$policy->task}",
            'description' => $policy->instructions,
            'priority' => 'medium',
            'scheduled_for' => $scheduledFor,
            'pm_policy_id' => $pmPolicyId,
            'status' => 'new'
        ]);
    }

    public function assignWorkOrder(string $workOrderId, string $userId): WorkOrder
    {
        $wo = WorkOrder::findOrFail($workOrderId);
        $wo->update([
            'assigned_to' => $userId,
            'status' => 'assigned'
        ]);
        
        return $wo->fresh();
    }

    public function startWorkOrder(string $workOrderId): WorkOrder
    {
        $wo = WorkOrder::findOrFail($workOrderId);
        $wo->update([
            'started_at' => now(),
            'status' => 'in_progress'
        ]);
        
        return $wo->fresh();
    }

    public function completeWorkOrder(string $workOrderId, ?string $completionNotes = null): WorkOrder
    {
        $wo = WorkOrder::findOrFail($workOrderId);
        
        DB::transaction(function () use ($wo, $completionNotes) {
            $wo->update([
                'completed_at' => now(),
                'status' => 'completed',
                'completion_notes' => $completionNotes
            ]);
            
            if ($wo->pm_policy_id) {
                $policy = PmPolicy::find($wo->pm_policy_id);
                if ($policy) {
                    $this->updatePmSchedule($policy);
                }
            }
        });
        
        return $wo->fresh();
    }

    public function cancelWorkOrder(string $workOrderId, string $reason): WorkOrder
    {
        $wo = WorkOrder::findOrFail($workOrderId);
        $wo->update([
            'status' => 'cancelled',
            'completion_notes' => "Cancelled: {$reason}"
        ]);
        
        return $wo->fresh();
    }

    public function addParts(string $workOrderId, array $parts): Collection
    {
        $woParts = collect();
        
        DB::transaction(function () use ($workOrderId, $parts, &$woParts) {
            foreach ($parts as $part) {
                $woPart = WoPart::create([
                    'work_order_id' => $workOrderId,
                    'part_id' => $part['part_id'],
                    'qty' => $part['qty'],
                    'unit_cost' => $part['unit_cost']
                ]);
                
                StockTxn::create([
                    'part_id' => $part['part_id'],
                    'kind' => 'issue',
                    'qty' => -$part['qty'],
                    'unit_cost' => $part['unit_cost'],
                    'work_order_id' => $workOrderId,
                    'occurred_at' => now()
                ]);
                
                $woParts->push($woPart);
            }
        });
        
        return $woParts;
    }

    public function addLabor(string $workOrderId, string $userId, float $hours, float $rate): WoLabor
    {
        return WoLabor::create([
            'work_order_id' => $workOrderId,
            'user_id' => $userId,
            'hours' => $hours,
            'rate' => $rate
        ]);
    }

    public function calculateWorkOrderCost(string $workOrderId): array
    {
        $wo = WorkOrder::with(['woParts', 'woLabor'])->findOrFail($workOrderId);
        
        $partsCost = $wo->woParts->sum(function ($wp) {
            return $wp->qty * $wp->unit_cost;
        });
        
        $laborCost = $wo->woLabor->sum(function ($wl) {
            return $wl->hours * $wl->rate;
        });
        
        $totalCost = $partsCost + $laborCost;
        
        return [
            'work_order_id' => $workOrderId,
            'parts_cost' => round($partsCost, 2),
            'labor_cost' => round($laborCost, 2),
            'total_cost' => round($totalCost, 2),
            'parts_count' => $wo->woParts->count(),
            'labor_entries' => $wo->woLabor->count()
        ];
    }

    public function getOverdueWorkOrders(): Collection
    {
        return WorkOrder::whereIn('status', ['new', 'assigned', 'in_progress'])
            ->where('scheduled_for', '<', now())
            ->with(['asset', 'assignedTo'])
            ->orderBy('priority')
            ->orderBy('scheduled_for')
            ->get();
    }

    public function getWorkOrdersByAsset(string $assetId, ?string $status = null): Collection
    {
        $query = WorkOrder::where('asset_id', $assetId)
            ->with(['assignedTo', 'createdBy']);
        
        if ($status) {
            $query->where('status', $status);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getWorkOrderStats(\DateTime $from, \DateTime $to): array
    {
        $workOrders = WorkOrder::whereBetween('created_at', [$from, $to])->get();
        
        $byStatus = $workOrders->groupBy('status')->map->count();
        $byKind = $workOrders->groupBy('kind')->map->count();
        $byPriority = $workOrders->groupBy('priority')->map->count();
        
        $completed = $workOrders->where('status', 'completed');
        $avgCompletionTime = $completed->avg(function ($wo) {
            return $wo->started_at && $wo->completed_at
                ? $wo->started_at->diffInHours($wo->completed_at)
                : null;
        });
        
        return [
            'period' => ['from' => $from, 'to' => $to],
            'total' => $workOrders->count(),
            'by_status' => $byStatus,
            'by_kind' => $byKind,
            'by_priority' => $byPriority,
            'avg_completion_hours' => $avgCompletionTime ? round($avgCompletionTime, 2) : null,
            'completion_rate' => $workOrders->count() > 0 
                ? round(($completed->count() / $workOrders->count()) * 100, 2) 
                : 0
        ];
    }

    protected function generateWorkOrderNumber(): string
    {
        $prefix = 'WO';
        $year = now()->format('y');
        $lastWo = WorkOrder::where('wo_num', 'like', "{$prefix}{$year}%")
            ->orderBy('wo_num', 'desc')
            ->first();
        
        if ($lastWo && preg_match("/{$prefix}{$year}(\d{5})/", $lastWo->wo_num, $matches)) {
            $sequence = intval($matches[1]) + 1;
        } else {
            $sequence = 1;
        }
        
        return sprintf('%s%s%05d', $prefix, $year, $sequence);
    }

    protected function updatePmSchedule(PmPolicy $policy): void
    {
        $schedule = $policy->pmSchedules()->first();
        
        if (!$schedule) {
            return;
        }
        
        $nextDue = null;
        
        switch ($policy->strategy) {
            case 'time':
                if ($policy->interval_value && $policy->interval_unit) {
                    $nextDue = now()->add($policy->interval_value, $policy->interval_unit);
                }
                break;
            case 'meter':
                break;
            case 'condition':
                break;
        }
        
        if ($nextDue) {
            $schedule->update([
                'last_done' => now(),
                'next_due' => $nextDue,
                'status' => 'scheduled'
            ]);
        }
    }
}
