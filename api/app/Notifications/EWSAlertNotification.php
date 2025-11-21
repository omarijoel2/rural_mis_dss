<?php

namespace App\Notifications;

use App\Channels\WebhookChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Twilio\TwilioChannel;
use NotificationChannels\Twilio\TwilioSmsMessage;

class EWSAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public array $alert,
        public array $requestedChannels = ['mail']
    ) {
        $this->onQueue('notifications');
    }

    public function via(object $notifiable): array
    {
        $channels = [];
        
        foreach ($this->requestedChannels as $channel) {
            $channels[] = match($channel) {
                'mail', 'email' => 'mail',
                'sms' => TwilioChannel::class,
                'webhook' => WebhookChannel::class,
                default => null,
            };
        }
        
        return array_filter($channels);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $severity = strtoupper($this->alert['severity'] ?? 'medium');
        $message = $this->alert['message'] ?? 'Alert triggered';
        $ruleName = $this->alert['rule_name'] ?? 'EWS Rule';
        
        return (new MailMessage)
            ->subject("[$severity] $ruleName - Rural Water MIS Alert")
            ->line("**Alert:** $message")
            ->line("**Severity:** $severity")
            ->line("**Time:** " . ($this->alert['created_at'] ?? now()->toDateTimeString()))
            ->when(isset($this->alert['trigger_values']), function ($mail) {
                return $mail->line("**Trigger Values:** " . json_encode($this->alert['trigger_values']));
            })
            ->action('View Alert', url('/dsa/ews'))
            ->line('Please acknowledge this alert in the EWS Console.');
    }

    public function toTwilio(object $notifiable): TwilioSmsMessage
    {
        $severity = strtoupper($this->alert['severity'] ?? 'MEDIUM');
        $message = $this->alert['message'] ?? 'Alert triggered';
        
        return (new TwilioSmsMessage())
            ->content("[$severity] $message - Rural Water MIS. View: " . url('/dsa/ews'));
    }

    public function toWebhook(object $notifiable): array
    {
        return [
            'url' => $notifiable->webhook_url ?? env('EWS_WEBHOOK_URL'),
            'payload' => [
                'event' => 'ews.alert.created',
                'alert' => $this->alert,
                'tenant_id' => $this->alert['tenant_id'] ?? null,
                'timestamp' => now()->toIso8601String(),
            ],
        ];
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
}
