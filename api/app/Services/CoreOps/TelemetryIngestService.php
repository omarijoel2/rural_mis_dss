<?php

namespace App\Services\CoreOps;

use App\Models\TelemetryTag;
use App\Models\TelemetryMeasurement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class TelemetryIngestService
{
    public function ingestBulk(array $measurements, string $tenantId): array
    {
        $inserted = 0;
        $failed = [];
        
        // Limit batch size to prevent DoS
        $measurements = array_slice($measurements, 0, 1000);

        DB::transaction(function () use ($measurements, $tenantId, &$inserted, &$failed) {
            foreach ($measurements as $measurement) {
                try {
                    // Scope tag lookup to tenant for security
                    $tag = TelemetryTag::where('tag', $measurement['tag'])
                        ->where('tenant_id', $tenantId)
                        ->first();
                    
                    if (!$tag) {
                        $failed[] = "Tag '{$measurement['tag']}' not found in your organization";
                        continue;
                    }

                    if (!$tag->enabled) {
                        $failed[] = "Tag '{$measurement['tag']}' is disabled";
                        continue;
                    }

                    $value = $this->scaleValue($tag, $measurement['value']);

                    TelemetryMeasurement::create([
                        'telemetry_tag_id' => $tag->id,
                        'ts' => $measurement['ts'],
                        'value' => $value,
                        'meta' => $measurement['meta'] ?? null,
                    ]);

                    $inserted++;
                } catch (\Exception $e) {
                    $failed[] = $e->getMessage();
                }
            }
        });

        return [
            'inserted' => $inserted,
            'failed' => count($failed),
            'errors' => $failed,
        ];
    }

    private function scaleValue(TelemetryTag $tag, float $rawValue): float
    {
        if (!$tag->scale) {
            return $rawValue;
        }

        $min = $tag->scale['min'] ?? 0;
        $max = $tag->scale['max'] ?? 100;
        $offset = $tag->scale['offset'] ?? 0;

        return (($rawValue - $min) / ($max - $min)) * 100 + $offset;
    }

    public function checkAlarms(TelemetryTag $tag, float $value): ?array
    {
        if (!$tag->thresholds) {
            return null;
        }

        $alarms = [];

        if (isset($tag->thresholds['hiHi']) && $value > $tag->thresholds['hiHi']) {
            $alarms[] = ['level' => 'critical', 'type' => 'hihi', 'value' => $value];
        } elseif (isset($tag->thresholds['hi']) && $value > $tag->thresholds['hi']) {
            $alarms[] = ['level' => 'warning', 'type' => 'hi', 'value' => $value];
        }

        if (isset($tag->thresholds['loLo']) && $value < $tag->thresholds['loLo']) {
            $alarms[] = ['level' => 'critical', 'type' => 'lolo', 'value' => $value];
        } elseif (isset($tag->thresholds['lo']) && $value < $tag->thresholds['lo']) {
            $alarms[] = ['level' => 'warning', 'type' => 'lo', 'value' => $value];
        }

        return empty($alarms) ? null : $alarms;
    }
}
