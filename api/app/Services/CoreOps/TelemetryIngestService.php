<?php

namespace App\Services\CoreOps;

use App\Models\TelemetryTag;
use App\Models\TelemetryMeasurement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class TelemetryIngestService
{
    /**
     * Ingest bulk telemetry measurements with HMAC validation and idempotency support
     */
    public function ingestBulk(array $measurements, string $tenantId, ?string $signature = null, ?string $idempotencyKey = null): array
    {
        // Validate HMAC signature if provided
        if ($signature) {
            $this->validateHmacSignature($measurements, $signature, $tenantId);
        }

        // Check idempotency - prevent duplicate processing
        if ($idempotencyKey) {
            $cacheKey = "telemetry_ingest:{$tenantId}:{$idempotencyKey}";
            
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }
        }

        $inserted = 0;
        $failed = [];
        
        // Limit batch size to prevent DoS
        $measurements = array_slice($measurements, 0, 1000);

        DB::transaction(function () use ($measurements, $tenantId, &$inserted, &$failed) {
            foreach ($measurements as $measurement) {
                try {
                    // Scope tag lookup to tenant for security
                    $tag = TelemetryTag::where('tag_name', $measurement['tag'])
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

                    // Validate data type
                    if (!$this->validateDataType($tag, $measurement['value'])) {
                        $failed[] = "Invalid data type for tag '{$measurement['tag']}'";
                        continue;
                    }

                    $value = $this->scaleValue($tag, $measurement['value']);

                    // Check for duplicate timestamp (prevent duplicate readings)
                    $exists = TelemetryMeasurement::where('telemetry_tag_id', $tag->id)
                        ->where('ts', $measurement['ts'])
                        ->exists();

                    if ($exists) {
                        $failed[] = "Duplicate reading for tag '{$measurement['tag']}' at {$measurement['ts']}";
                        continue;
                    }

                    $telemetryMeasurement = TelemetryMeasurement::create([
                        'telemetry_tag_id' => $tag->id,
                        'ts' => $measurement['ts'],
                        'value' => $value,
                        'meta' => $measurement['meta'] ?? null,
                    ]);

                    // Check alarms and trigger notifications
                    $alarms = $this->checkAlarms($tag, $value);
                    if ($alarms) {
                        $this->triggerAlarmNotifications($tag, $alarms, $telemetryMeasurement);
                    }

                    $inserted++;
                } catch (\Exception $e) {
                    $failed[] = $e->getMessage();
                }
            }
        });

        $result = [
            'inserted' => $inserted,
            'failed' => count($failed),
            'errors' => array_slice($failed, 0, 10), // Limit error list
        ];

        // Cache result for idempotency (24 hours)
        if ($idempotencyKey) {
            $cacheKey = "telemetry_ingest:{$tenantId}:{$idempotencyKey}";
            Cache::put($cacheKey, $result, 86400);
        }

        return $result;
    }

    /**
     * Validate HMAC signature for request authenticity
     */
    private function validateHmacSignature(array $payload, string $signature, string $tenantId): void
    {
        // Get tenant's HMAC secret from config or database
        $secret = config('telemetry.hmac_secret') ?? env('TELEMETRY_HMAC_SECRET');
        
        if (!$secret) {
            throw new \Exception('HMAC secret not configured');
        }

        // Compute expected signature
        $computedSignature = hash_hmac('sha256', json_encode($payload), $secret);

        // Constant-time comparison to prevent timing attacks
        if (!hash_equals($computedSignature, $signature)) {
            throw new \Exception('Invalid HMAC signature - request authentication failed');
        }
    }

    /**
     * Validate data type matches tag configuration
     */
    private function validateDataType(TelemetryTag $tag, $value): bool
    {
        switch ($tag->data_type) {
            case 'float':
            case 'integer':
                return is_numeric($value);
            case 'boolean':
                return is_bool($value) || in_array($value, [0, 1, '0', '1', 'true', 'false']);
            case 'string':
                return is_string($value);
            default:
                return true;
        }
    }

    /**
     * Apply scaling transformation to raw value
     */
    private function scaleValue(TelemetryTag $tag, float $rawValue): float
    {
        if (!$tag->scale) {
            return $rawValue;
        }

        $min = $tag->scale['min'] ?? 0;
        $max = $tag->scale['max'] ?? 100;
        $offset = $tag->scale['offset'] ?? 0;
        $multiplier = $tag->scale['multiplier'] ?? 1;

        // Apply linear transformation: (value - min) / (max - min) * multiplier + offset
        if ($max !== $min) {
            return (($rawValue - $min) / ($max - $min)) * $multiplier + $offset;
        }

        return $rawValue * $multiplier + $offset;
    }

    /**
     * Check if value violates configured thresholds
     */
    public function checkAlarms(TelemetryTag $tag, float $value): ?array
    {
        if (!$tag->thresholds) {
            return null;
        }

        $alarms = [];

        // Critical high alarm
        if (isset($tag->thresholds['hiHi']) && $value > $tag->thresholds['hiHi']) {
            $alarms[] = [
                'level' => 'critical',
                'type' => 'hihi',
                'value' => $value,
                'threshold' => $tag->thresholds['hiHi'],
                'message' => "{$tag->tag_name} exceeded critical high threshold: {$value} > {$tag->thresholds['hiHi']}",
            ];
        } 
        // Warning high alarm
        elseif (isset($tag->thresholds['hi']) && $value > $tag->thresholds['hi']) {
            $alarms[] = [
                'level' => 'warning',
                'type' => 'hi',
                'value' => $value,
                'threshold' => $tag->thresholds['hi'],
                'message' => "{$tag->tag_name} exceeded warning high threshold: {$value} > {$tag->thresholds['hi']}",
            ];
        }

        // Critical low alarm
        if (isset($tag->thresholds['loLo']) && $value < $tag->thresholds['loLo']) {
            $alarms[] = [
                'level' => 'critical',
                'type' => 'lolo',
                'value' => $value,
                'threshold' => $tag->thresholds['loLo'],
                'message' => "{$tag->tag_name} below critical low threshold: {$value} < {$tag->thresholds['loLo']}",
            ];
        } 
        // Warning low alarm
        elseif (isset($tag->thresholds['lo']) && $value < $tag->thresholds['lo']) {
            $alarms[] = [
                'level' => 'warning',
                'type' => 'lo',
                'value' => $value,
                'threshold' => $tag->thresholds['lo'],
                'message' => "{$tag->tag_name} below warning low threshold: {$value} < {$tag->thresholds['lo']}",
            ];
        }

        return empty($alarms) ? null : $alarms;
    }

    /**
     * Trigger alarm notifications via SSE and persistent storage
     */
    private function triggerAlarmNotifications(TelemetryTag $tag, array $alarms, TelemetryMeasurement $measurement): void
    {
        foreach ($alarms as $alarm) {
            // Store alarm in database for historical tracking
            DB::table('telemetry_alarms')->insert([
                'telemetry_tag_id' => $tag->id,
                'telemetry_measurement_id' => $measurement->id,
                'severity' => $alarm['level'],
                'type' => $alarm['type'],
                'message' => $alarm['message'],
                'value' => $alarm['value'],
                'threshold' => $alarm['threshold'],
                'acknowledged_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Broadcast to SSE listeners (Operations Console)
            // This would integrate with your SSE implementation
            event(new \App\Events\TelemetryAlarmTriggered([
                'tag_name' => $tag->tag_name,
                'severity' => $alarm['level'],
                'message' => $alarm['message'],
                'value' => $alarm['value'],
                'threshold' => $alarm['threshold'],
                'asset_name' => $tag->asset?->name,
                'scheme_name' => $tag->scheme?->name,
                'timestamp' => $measurement->ts,
            ]));
        }
    }

    /**
     * Get recent measurements for a tag
     */
    public function getRecentMeasurements(TelemetryTag $tag, int $limit = 100): Collection
    {
        return TelemetryMeasurement::where('telemetry_tag_id', $tag->id)
            ->orderBy('ts', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Calculate statistics for a tag over a time period
     */
    public function calculateStatistics(TelemetryTag $tag, \DateTime $startDate, \DateTime $endDate): array
    {
        $measurements = TelemetryMeasurement::where('telemetry_tag_id', $tag->id)
            ->whereBetween('ts', [$startDate, $endDate])
            ->pluck('value');

        if ($measurements->isEmpty()) {
            return [
                'count' => 0,
                'min' => null,
                'max' => null,
                'avg' => null,
                'sum' => null,
            ];
        }

        return [
            'count' => $measurements->count(),
            'min' => $measurements->min(),
            'max' => $measurements->max(),
            'avg' => round($measurements->avg(), 2),
            'sum' => $measurements->sum(),
        ];
    }
}
