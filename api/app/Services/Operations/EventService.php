<?php

namespace App\Services\Operations;

use App\Models\Event;
use App\Models\EventAction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EventService
{
    const CORRELATION_WINDOW_MINUTES = 30;
    const DEFAULT_SLA_HOURS = [
        'critical' => 2,
        'high' => 4,
        'medium' => 24,
        'low' => 72,
    ];

    /**
     * Deduplicate and process event ingestion
     * Returns existing event if duplicate found, new event otherwise
     */
    public function ingestEvent(array $data): Event
    {
        DB::beginTransaction();
        try {
            // Check for existing event by external_id (unique constraint path)
            if (!empty($data['external_id']) && !empty($data['source'])) {
                $existing = Event::where('source', $data['source'])
                    ->where('external_id', $data['external_id'])
                    ->first();
                
                if ($existing) {
                    // Update detected_at to extend window, keep event active
                    $existing->update(['detected_at' => $data['detected_at'] ?? now()]);
                    $this->logAction($existing->id, 'duplicate_detected', auth()->id(), $data);
                    DB::commit();
                    return $existing;
                }
            }

            // Check for correlation with existing events
            $correlationKey = $this->generateCorrelationKey(
                $data['tenant_id'],
                $data['facility_id'] ?? $data['scheme_id'] ?? $data['dma_id'] ?? null,
                $data['category'],
                $data['detected_at'] ?? now()
            );

            $correlated = $this->findCorrelatedEvent($correlationKey);
            
            if ($correlated) {
                // Merge into existing correlated event
                $correlated->update([
                    'detected_at' => $data['detected_at'] ?? now(),
                    'attributes' => array_merge($correlated->attributes ?? [], $data['attributes'] ?? []),
                ]);
                $this->logAction($correlated->id, 'correlated', auth()->id(), $data);
                DB::commit();
                return $correlated;
            }

            // Create new event
            $event = Event::create(array_merge($data, [
                'correlation_key' => $correlationKey,
                'sla_due_at' => $this->calculateSlaDueAt($data['severity'] ?? 'medium', $data['detected_at'] ?? now()),
            ]));

            $this->logAction($event->id, 'created', auth()->id());
            
            DB::commit();
            return $event;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Generate SHA256-based correlation key
     */
    protected function generateCorrelationKey(string $tenantId, ?string $entityId, string $category, $detectedAt): string
    {
        $timestamp = Carbon::parse($detectedAt);
        $windowStart = $timestamp->copy()->startOfMinute()->floorMinutes(self::CORRELATION_WINDOW_MINUTES);
        
        $parts = [
            $tenantId,
            $entityId ?? 'null',
            $category,
            $windowStart->toIso8601String(),
        ];
        
        return hash('sha256', implode('|', $parts));
    }

    /**
     * Find correlated event within window
     */
    protected function findCorrelatedEvent(string $correlationKey): ?Event
    {
        return Event::where('correlation_key', $correlationKey)
            ->whereIn('status', ['new', 'ack', 'in_progress'])
            ->orderBy('detected_at', 'desc')
            ->first();
    }

    /**
     * Calculate SLA due timestamp based on severity
     */
    protected function calculateSlaDueAt(string $severity, $detectedAt): Carbon
    {
        $hours = self::DEFAULT_SLA_HOURS[$severity] ?? self::DEFAULT_SLA_HOURS['medium'];
        return Carbon::parse($detectedAt)->addHours($hours);
    }

    /**
     * Acknowledge event
     */
    public function acknowledgeEvent(int $eventId, ?string $note = null): Event
    {
        $event = Event::findOrFail($eventId);
        
        $event->update([
            'status' => 'ack',
            'acknowledged_at' => now(),
        ]);
        
        $this->logAction($eventId, 'acknowledged', auth()->id(), ['note' => $note]);
        
        return $event;
    }

    /**
     * Resolve event
     */
    public function resolveEvent(int $eventId, ?string $resolution = null): Event
    {
        $event = Event::findOrFail($eventId);
        
        $event->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
        
        $this->logAction($eventId, 'resolved', auth()->id(), ['resolution' => $resolution]);
        
        return $event;
    }

    /**
     * Link event to entity (Work Order, Anomaly, etc)
     */
    public function linkEvent(int $eventId, string $entityType, int $entityId): void
    {
        $event = Event::findOrFail($eventId);
        
        $event->links()->create([
            'entity_type' => $entityType,
            'entity_id' => $entityId,
        ]);
        
        $this->logAction($eventId, 'linked', auth()->id(), [
            'entity_type' => $entityType,
            'entity_id' => $entityId,
        ]);
    }

    /**
     * Log event action
     */
    protected function logAction(int $eventId, string $action, ?string $actorId = null, array $payload = []): void
    {
        EventAction::create([
            'event_id' => $eventId,
            'action' => $action,
            'actor_id' => $actorId ?? auth()->id(),
            'payload' => $payload,
            'occurred_at' => now(),
        ]);
    }

    /**
     * Get events needing escalation (SLA overdue)
     */
    public function getEventsForEscalation(): \Illuminate\Database\Eloquent\Collection
    {
        return Event::whereIn('status', ['new', 'ack', 'in_progress'])
            ->where('sla_due_at', '<=', now())
            ->get();
    }
}
