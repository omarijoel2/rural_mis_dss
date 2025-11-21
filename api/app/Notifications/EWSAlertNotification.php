<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;

class EWSAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public array $alert,
        public array $channels = ['mail']
    ) {
        $this->onQueue('notifications');
    }

    public function via(object $notifiable): array
    {
        return $this->channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $severity = strtoupper($this->alert['severity'] ?? 'medium');
        $message = $this->alert['message'] ?? 'Alert triggered';
        $ruleName = $this->alert['rule_name'] ?? 'EWS Rule';
        
        $color = match($severity) {
            'CRITICAL' => 'red',
            'HIGH' => 'orange',
            'MEDIUM' => 'yellow',
            default => 'blue',
        };

        return (new MailMessage)
            ->subject("[$severity] $ruleName")
            ->line("**Alert:** $message")
            ->line("**Severity:** $severity")
            ->line("**Time:** " . ($this->alert['created_at'] ?? now()->toDateTimeString()))
            ->when(isset($this->alert['trigger_values']), function ($mail) {
                return $mail->line("**Trigger Values:** " . json_encode($this->alert['trigger_values']));
            })
            ->action('View Alert', url('/dsa/ews'))
            ->line('Please acknowledge this alert in the EWS Console.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'alert_id' => $this->alert['id'] ?? null,
            'rule_name' => $this->alert['rule_name'] ?? null,
            'severity' => $this->alert['severity'] ?? 'medium',
            'message' => $this->alert['message'] ?? '',
            'trigger_values' => $this->alert['trigger_values'] ?? [],
        ];
    }

    public function toTwilio(object $notifiable): array
    {
        $severity = strtoupper($this->alert['severity'] ?? 'MEDIUM');
        $message = $this->alert['message'] ?? 'Alert triggered';
        
        return [
            'from' => env('TWILIO_FROM'),
            'body' => "[$severity] $message - Rural Water MIS",
        ];
    }

    public function toWebhook(object $notifiable): array
    {
        return [
            'url' => $notifiable->webhook_url ?? env('EWS_WEBHOOK_URL'),
            'payload' => [
                'event' => 'ews.alert.created',
                'alert' => $this->alert,
                'timestamp' => now()->toIso8601String(),
            ],
        ];
    }
}
