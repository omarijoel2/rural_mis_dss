<?php

namespace App\Services\Cmms;

use App\Models\Cmms\Asset;
use App\Models\Cmms\WorkOrder;
use App\Models\Cmms\ConditionTag;
use App\Models\Cmms\Alarm;
use App\Models\Cmms\JobPlan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PredictiveMaintenanceService
{
    /**
     * Check for persistent condition breaches and create predictive work orders
     */
    public function checkPersistentBreachesAndCreateWOs(): array
    {
        $result = ['created' => 0, 'updated' => 0, 'errors' => []];

        try {
            // Find alarms that have been breached for more than 24 hours
            $persistentBreaches = Alarm::where('state', 'breached')
                ->where('raised_at', '<=', Carbon::now()->subHours(24))
                ->where('cleared_at', null)
                ->with('tag')
                ->get();

            foreach ($persistentBreaches as $alarm) {
                try {
                    // Check if predictive WO already exists for this tag
                    $existingWO = WorkOrder::where('asset_id', $alarm->tag->asset_id)
                        ->where('kind', 'predictive')
                        ->whereIn('status', ['new', 'assigned', 'in_progress'])
                        ->first();

                    if ($existingWO) {
                        continue; // WO already created for this asset
                    }

                    // Create predictive work order
                    $wo = WorkOrder::create([
                        'tenant_id' => auth()->user()->tenant_id,
                        'asset_id' => $alarm->tag->asset_id,
                        'kind' => 'predictive',
                        'priority' => $this->calculatePriorityFromAlarm($alarm),
                        'status' => 'new',
                        'description' => "Predictive maintenance triggered by {$alarm->tag->tag} breach (threshold: {$alarm->tag->thresholds_json['hi']}).",
                        'est_labor_h' => 4,
                        'est_parts_cost' => 0,
                    ]);

                    // Suggest a job plan based on asset class
                    $suggestedPlan = $this->suggestJobPlan($alarm->tag->asset_id);
                    if ($suggestedPlan) {
                        $wo->job_plan_id = $suggestedPlan->id;
                        $wo->save();
                    }

                    $result['created']++;
                } catch (\Exception $e) {
                    $result['errors'][] = "Error creating WO for alarm {$alarm->id}: " . $e->getMessage();
                }
            }
        } catch (\Exception $e) {
            $result['errors'][] = 'Persistent breach check failed: ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * Calculate health score for an asset (0-100)
     */
    public function calculateAssetHealthScore($assetId): float
    {
        $asset = Asset::with('tags')->find($assetId);
        if (!$asset) {
            return 100.0;
        }

        $healthScore = 100.0;

        // Check each condition tag
        foreach ($asset->tags as $tag) {
            $latestAlarm = $tag->alarms()->latest('raised_at')->first();
            if ($latestAlarm && $latestAlarm->state === 'breached') {
                $severity = $this->getAlarmSeverity($latestAlarm);
                $healthScore -= $severity; // Reduce by 5-25 based on threshold level
            }
        }

        return max(0, min(100, $healthScore));
    }

    /**
     * Calculate remaining useful life (heuristic)
     */
    public function estimateRemainingUsefulLife($assetId): array
    {
        $asset = Asset::find($assetId);
        if (!$asset) {
            return ['months_remaining' => null, 'status' => 'unknown'];
        }

        $healthScore = $this->calculateAssetHealthScore($assetId);

        // Heuristic: map health score to remaining life
        if ($healthScore > 80) {
            return ['months_remaining' => 36, 'status' => 'healthy'];
        } elseif ($healthScore > 60) {
            return ['months_remaining' => 18, 'status' => 'degrading'];
        } elseif ($healthScore > 40) {
            return ['months_remaining' => 6, 'status' => 'critical'];
        } else {
            return ['months_remaining' => 1, 'status' => 'failure_imminent'];
        }
    }

    /**
     * Get alarm severity based on threshold breach level
     */
    private function getAlarmSeverity($alarm): float
    {
        $thresholds = $alarm->tag->thresholds_json ?? [];
        $currentValue = $alarm->value ?? 0;

        if (isset($thresholds['hihi'])) {
            if ($currentValue >= $thresholds['hihi']) {
                return 25; // HiHi alarm: very high severity
            }
        }

        if (isset($thresholds['hi'])) {
            if ($currentValue >= $thresholds['hi']) {
                return 15; // Hi alarm: high severity
            }
        }

        if (isset($thresholds['lolo'])) {
            if ($currentValue <= $thresholds['lolo']) {
                return 20; // LoLo alarm: very high severity
            }
        }

        if (isset($thresholds['lo'])) {
            if ($currentValue <= $thresholds['lo']) {
                return 10; // Lo alarm: moderate severity
            }
        }

        return 5; // Minor breach
    }

    /**
     * Calculate priority based on alarm severity and asset criticality
     */
    private function calculatePriorityFromAlarm($alarm): string
    {
        $severity = $this->getAlarmSeverity($alarm);
        $criticality = $alarm->tag->asset->class->criticality ?? 'medium';

        if ($severity >= 25 || $criticality === 'high') {
            return 'critical';
        } elseif ($severity >= 15 || $criticality === 'medium') {
            return 'high';
        } elseif ($severity >= 10) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Suggest best job plan for an asset
     */
    private function suggestJobPlan($assetId): ?JobPlan
    {
        $asset = Asset::find($assetId);
        if (!$asset) {
            return null;
        }

        return JobPlan::where('asset_class_id', $asset->class_id)
            ->where('is_active', true)
            ->orderBy('updated_at', 'desc')
            ->first();
    }
}
