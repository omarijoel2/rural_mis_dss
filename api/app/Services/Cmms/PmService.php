<?php

namespace App\Services\Cmms;

use App\Models\PmTemplate;
use App\Models\PmGenerationLog;
use App\Models\PmDeferral;
use App\Models\PmComplianceMetric;
use App\Models\WorkOrder;
use App\Services\WorkOrderService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PmService
{
    public function __construct(protected WorkOrderService $workOrderService)
    {
    }

    public function getAllTemplates(array $filters = []): Collection
    {
        $query = PmTemplate::with(['assetClass', 'jobPlan']);
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        if (isset($filters['asset_class_id'])) {
            $query->where('asset_class_id', $filters['asset_class_id']);
        }
        
        if (isset($filters['trigger_type'])) {
            $query->where('trigger_type', $filters['trigger_type']);
        }
        
        return $query->orderBy('name')->get();
    }

    public function getTemplate(int $id): PmTemplate
    {
        return PmTemplate::with(['assetClass', 'jobPlan'])->findOrFail($id);
    }

    public function createTemplate(array $data): PmTemplate
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        
        if ($data['trigger_type'] === 'time_based' && isset($data['frequency_days'])) {
            $data['next_gen_date'] = Carbon::now()->addDays($data['frequency_days']);
        }
        
        return PmTemplate::create($data);
    }

    public function updateTemplate(int $id, array $data): PmTemplate
    {
        $template = PmTemplate::findOrFail($id);
        $template->update($data);
        
        return $template->fresh(['assetClass', 'jobPlan']);
    }

    public function deleteTemplate(int $id): bool
    {
        $template = PmTemplate::findOrFail($id);
        return $template->delete();
    }

    public function generateWorkOrders(?int $templateId = null): Collection
    {
        $query = PmTemplate::where('is_active', true);
        
        if ($templateId) {
            $query->where('id', $templateId);
        } else {
            $query->where('trigger_type', 'time_based')
                  ->where('next_gen_date', '<=', Carbon::now());
        }
        
        $templates = $query->get();
        $generated = collect();
        
        foreach ($templates as $template) {
            $workOrders = $this->generateFromTemplate($template);
            $generated = $generated->merge($workOrders);
        }
        
        return $generated;
    }

    protected function generateFromTemplate(PmTemplate $template): Collection
    {
        $assets = DB::table('assets')
            ->where('class_id', $template->asset_class_id)
            ->where('status', 'active')
            ->get();
        
        $workOrders = collect();
        
        foreach ($assets as $asset) {
            $scheduledDate = Carbon::now()->addDays($template->tolerance_days ?? 0);
            
            $wo = $this->workOrderService->createWorkOrder([
                'kind' => 'pm',
                'asset_id' => $asset->id,
                'job_plan_id' => $template->job_plan_id,
                'title' => "PM: {$template->name} - {$asset->name}",
                'description' => $template->description,
                'priority' => 'medium',
                'scheduled_for' => $scheduledDate,
                'status' => 'draft'
            ]);
            
            PmGenerationLog::create([
                'pm_template_id' => $template->id,
                'work_order_id' => $wo->id,
                'asset_id' => $asset->id,
                'scheduled_date' => $scheduledDate,
                'status' => 'generated',
                'generated_at' => now()
            ]);
            
            if ($template->job_plan_id) {
                $this->workOrderService->addChecklistFromJobPlan($wo->id, $template->job_plan_id);
            }
            
            $workOrders->push($wo);
        }
        
        $template->update([
            'next_gen_date' => Carbon::now()->addDays($template->frequency_days ?? 30)
        ]);
        
        return $workOrders;
    }

    public function deferPm(int $logId, string $deferredTo, string $reasonCode, ?string $notes = null): PmDeferral
    {
        $log = PmGenerationLog::findOrFail($logId);
        
        return PmDeferral::create([
            'pm_generation_log_id' => $logId,
            'original_date' => $log->scheduled_date,
            'deferred_to' => $deferredTo,
            'reason_code' => $reasonCode,
            'notes' => $notes,
            'deferred_by' => auth()->id(),
            'deferred_at' => now()
        ]);
    }

    public function calculateCompliance(string $periodStart, string $periodEnd): PmComplianceMetric
    {
        $tenantId = auth()->user()->tenant_id;
        
        $logs = PmGenerationLog::whereBetween('scheduled_date', [$periodStart, $periodEnd])->get();
        
        $pmScheduled = $logs->count();
        $pmCompletedOnTime = $logs->where('status', 'completed')
            ->filter(function ($log) {
                return $log->work_order && 
                       $log->work_order->completed_at <= $log->scheduled_date;
            })->count();
        
        $pmCompletedLate = $logs->where('status', 'completed')
            ->filter(function ($log) {
                return $log->work_order && 
                       $log->work_order->completed_at > $log->scheduled_date;
            })->count();
        
        $pmDeferred = PmDeferral::whereBetween('deferred_at', [$periodStart, $periodEnd])->count();
        
        $breakdownWo = WorkOrder::where('kind', 'cm')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->count();
        
        $compliancePct = $pmScheduled > 0 ? ($pmCompletedOnTime / $pmScheduled) * 100 : 0;
        $pmBreakdownRatio = $pmScheduled > 0 ? $breakdownWo / $pmScheduled : 0;
        
        return PmComplianceMetric::create([
            'tenant_id' => $tenantId,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'pm_scheduled' => $pmScheduled,
            'pm_completed_on_time' => $pmCompletedOnTime,
            'pm_completed_late' => $pmCompletedLate,
            'pm_deferred' => $pmDeferred,
            'pm_skipped' => 0,
            'breakdown_wo' => $breakdownWo,
            'compliance_pct' => round($compliancePct, 2),
            'pm_breakdown_ratio' => round($pmBreakdownRatio, 4)
        ]);
    }
}
