<?php

namespace App\Services\Cmms;

use App\Models\ConditionTag;
use App\Models\ConditionReading;
use App\Models\ConditionAlarm;
use App\Models\AssetHealthScore;
use App\Models\PredictiveRule;
use App\Models\PredictiveTrigger;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ConditionMonitoringService
{
    public function getAllTags(array $filters = []): Collection
    {
        $query = ConditionTag::with(['asset']);
        
        if (isset($filters['asset_id'])) {
            $query->where('asset_id', $filters['asset_id']);
        }
        
        if (isset($filters['health_status'])) {
            $query->where('health_status', $filters['health_status']);
        }
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        return $query->orderBy('tag')->get();
    }

    public function getTag(int $id): ConditionTag
    {
        return ConditionTag::with(['asset', 'alarms', 'readings'])->findOrFail($id);
    }

    public function createTag(array $data): ConditionTag
    {
        return ConditionTag::create($data);
    }

    public function updateTag(int $id, array $data): ConditionTag
    {
        $tag = ConditionTag::findOrFail($id);
        $tag->update($data);
        
        return $tag->fresh(['asset']);
    }

    public function deleteTag(int $id): bool
    {
        $tag = ConditionTag::findOrFail($id);
        return $tag->delete();
    }

    public function ingestReading(int $tagId, float $value, ?string $source = null): ConditionReading
    {
        $tag = ConditionTag::findOrFail($tagId);
        
        $reading = ConditionReading::create([
            'tag_id' => $tagId,
            'value' => $value,
            'source' => $source ?? 'manual',
            'read_at' => now()
        ]);
        
        $tag->update([
            'last_value' => $value,
            'last_reading_at' => now()
        ]);
        
        $this->evaluateThresholds($tag, $value);
        
        return $reading;
    }

    protected function evaluateThresholds(ConditionTag $tag, float $value): void
    {
        $thresholds = $tag->thresholds ?? [];
        $status = 'normal';
        $severity = null;
        
        if (isset($thresholds['critical_high']) && $value >= $thresholds['critical_high']) {
            $status = 'critical';
            $severity = 'critical';
        } elseif (isset($thresholds['alarm_high']) && $value >= $thresholds['alarm_high']) {
            $status = 'alarm';
            $severity = 'high';
        } elseif (isset($thresholds['warning_high']) && $value >= $thresholds['warning_high']) {
            $status = 'warning';
            $severity = 'medium';
        } elseif (isset($thresholds['critical_low']) && $value <= $thresholds['critical_low']) {
            $status = 'critical';
            $severity = 'critical';
        } elseif (isset($thresholds['alarm_low']) && $value <= $thresholds['alarm_low']) {
            $status = 'alarm';
            $severity = 'high';
        } elseif (isset($thresholds['warning_low']) && $value <= $thresholds['warning_low']) {
            $status = 'warning';
            $severity = 'medium';
        }
        
        $tag->update(['health_status' => $status]);
        
        if ($severity && !in_array($status, ['normal'])) {
            $this->createAlarm($tag, $value, $severity);
        }
    }

    protected function createAlarm(ConditionTag $tag, float $value, string $severity): void
    {
        $existingAlarm = ConditionAlarm::where('tag_id', $tag->id)
            ->where('state', 'active')
            ->where('severity', $severity)
            ->first();
        
        if (!$existingAlarm) {
            ConditionAlarm::create([
                'tag_id' => $tag->id,
                'severity' => $severity,
                'message' => "{$tag->parameter} {$tag->health_status}: {$value} {$tag->unit}",
                'value' => $value,
                'state' => 'active',
                'raised_at' => now()
            ]);
        }
    }

    public function acknowledgeAlarm(int $alarmId, ?string $notes = null): ConditionAlarm
    {
        $alarm = ConditionAlarm::findOrFail($alarmId);
        
        $alarm->update([
            'state' => 'acknowledged',
            'ack_by' => auth()->id(),
            'ack_at' => now(),
            'ack_notes' => $notes
        ]);
        
        return $alarm->fresh();
    }

    public function clearAlarm(int $alarmId): ConditionAlarm
    {
        $alarm = ConditionAlarm::findOrFail($alarmId);
        
        $alarm->update([
            'state' => 'cleared',
            'cleared_at' => now()
        ]);
        
        return $alarm->fresh();
    }

    public function calculateAssetHealth(int $assetId): AssetHealthScore
    {
        $tags = ConditionTag::where('asset_id', $assetId)->get();
        
        $healthFactors = [];
        foreach ($tags as $tag) {
            $healthFactors[$tag->tag] = $tag->health_status;
        }
        
        $normalCount = $tags->where('health_status', 'normal')->count();
        $overallScore = $tags->count() > 0 ? ($normalCount / $tags->count()) * 100 : 100;
        
        $asset = DB::table('assets')->find($assetId);
        $ageScore = $this->calculateAgeScore($asset);
        
        return AssetHealthScore::updateOrCreate(
            ['asset_id' => $assetId],
            [
                'overall_score' => round($overallScore, 2),
                'condition_score' => round($overallScore, 2),
                'age_score' => $ageScore,
                'mtbf_days' => null,
                'rul_days' => null,
                'factors' => $healthFactors,
                'calculated_at' => now()
            ]
        );
    }

    protected function calculateAgeScore($asset): float
    {
        if (!$asset || !$asset->install_date) {
            return 100.0;
        }
        
        $installDate = Carbon::parse($asset->install_date);
        $ageYears = $installDate->diffInYears(now());
        
        $expectedLife = 15;
        $ageScore = max(0, (1 - ($ageYears / $expectedLife)) * 100);
        
        return round($ageScore, 2);
    }

    public function evaluatePredictiveRules(): Collection
    {
        $rules = PredictiveRule::where('is_active', true)->get();
        $triggers = collect();
        
        foreach ($rules as $rule) {
            $conditions = $rule->conditions ?? [];
            
            foreach ($conditions as $condition) {
                $tags = ConditionTag::where('asset_class_id', $rule->asset_class_id)
                    ->where('parameter', $condition['parameter'] ?? null)
                    ->get();
                
                foreach ($tags as $tag) {
                    if ($this->conditionMet($tag, $condition)) {
                        $trigger = PredictiveTrigger::create([
                            'rule_id' => $rule->id,
                            'asset_id' => $tag->asset_id,
                            'triggered_at' => now(),
                            'details' => [
                                'tag' => $tag->tag,
                                'value' => $tag->last_value,
                                'condition' => $condition
                            ]
                        ]);
                        
                        $triggers->push($trigger);
                    }
                }
            }
        }
        
        return $triggers;
    }

    protected function conditionMet(ConditionTag $tag, array $condition): bool
    {
        $operator = $condition['operator'] ?? '>';
        $threshold = $condition['threshold'] ?? 0;
        $value = $tag->last_value ?? 0;
        
        return match ($operator) {
            '>' => $value > $threshold,
            '>=' => $value >= $threshold,
            '<' => $value < $threshold,
            '<=' => $value <= $threshold,
            '==' => $value == $threshold,
            default => false
        };
    }
}
