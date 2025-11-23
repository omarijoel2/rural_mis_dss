<?php

namespace App\Jobs\Operations;

use App\Models\Event;
use App\Services\Operations\EventService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * EscalateEventJob - Monitors SLA timers and escalates overdue events
 * 
 * Runs periodically to:
 * - Find events with overdue SLA
 * - Trigger escalation notifications
 * - Create escalation audit trail
 * - Optionally auto-escalate to on-call teams
 */
class EscalateEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected EventService $eventService
    ) {}

    /**
     * Execute the job to check and escalate overdue events
     */
    public function handle(): void
    {
        try {
            // Get all events needing escalation (SLA overdue, not yet resolved)
            $overdueEvents = Event::whereIn('status', ['new', 'ack', 'in_progress'])
                ->where('sla_due_at', '<=', now())
                ->where(function ($query) {
                    // Don't re-escalate if already escalated recently
                    $query->whereNull('escalated_at')
                        ->orWhere('escalated_at', '<=', now()->subMinutes(30));
                })
                ->get();

            Log::info('EscalateEventJob: Found ' . $overdueEvents->count() . ' events for escalation');

            foreach ($overdueEvents as $event) {
                $this->escalateEvent($event);
            }
        } catch (\Exception $e) {
            Log::error('EscalateEventJob error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    /**
     * Escalate a single event
     */
    protected function escalateEvent(Event $event): void
    {
        try {
            // Calculate SLA overdue duration
            $overdueMinutes = now()->diffInMinutes($event->sla_due_at);

            // Log escalation action
            $event->actions()->create([
                'action' => 'escalated',
                'actor_id' => null, // System action
                'payload' => [
                    'reason' => 'SLA timeout',
                    'overdue_minutes' => $overdueMinutes,
                    'severity' => $event->severity,
                    'category' => $event->category,
                ],
                'occurred_at' => now(),
            ]);

            // Update escalation timestamp
            $event->update(['escalated_at' => now()]);

            // Queue notification to on-call teams
            // (if escalation policy integration enabled)
            $this->notifyEscalation($event, $overdueMinutes);

            Log::info('Event escalated', [
                'event_id' => $event->id,
                'overdue_minutes' => $overdueMinutes,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to escalate event', [
                'event_id' => $event->id,
                'exception' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send escalation notifications
     */
    protected function notifyEscalation(Event $event, int $overdueMinutes): void
    {
        // This would integrate with NotificationService
        // For MVP: Just log and create action record
        
        $severityLevel = match($event->severity) {
            'critical' => 'CRITICAL',
            'high' => 'HIGH',
            'medium' => 'MEDIUM',
            'low' => 'LOW',
            default => 'UNKNOWN',
        };

        $message = "[{$severityLevel}] Event SLA OVERDUE by {$overdueMinutes} minutes: {$event->category}";

        Log::warning('SLA Escalation: ' . $message, [
            'event_id' => $event->id,
            'facility_id' => $event->facility_id,
            'severity' => $event->severity,
        ]);

        // TODO: Dispatch NotifyJob when NotificationService is ready
        // NotifyJob::dispatch([
        //     'type' => 'escalation',
        //     'event_id' => $event->id,
        //     'message' => $message,
        //     'channels' => ['email', 'sms'],
        // ]);
    }
}
