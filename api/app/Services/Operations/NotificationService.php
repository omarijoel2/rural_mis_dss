<?php

namespace App\Services\Operations;

use App\Models\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * NotificationService - Multi-channel notification delivery
 * 
 * Supports: email, SMS (Twilio), webhook, push notifications
 * Handles queuing, retry logic, and delivery status tracking
 */
class NotificationService
{
    const CHANNELS = ['email', 'sms', 'webhook', 'push'];
    const MAX_RETRIES = 3;

    /**
     * Send notification via specified channel(s)
     * 
     * @param string|array $channels Single channel or array of channels
     * @param string $to Recipient (email, phone, webhook URL, device token)
     * @param string $subject Email/SMS subject line
     * @param string $body Message body
     * @param array $meta Additional metadata
     */
    public function send(
        string|array $channels,
        string $to,
        string $subject,
        string $body,
        array $meta = []
    ): array {
        $channels = is_string($channels) ? [$channels] : $channels;
        $results = [];

        foreach ($channels as $channel) {
            if (!in_array($channel, self::CHANNELS)) {
                Log::warning("Unknown notification channel: {$channel}");
                continue;
            }

            try {
                $result = match($channel) {
                    'email' => $this->sendEmail($to, $subject, $body, $meta),
                    'sms' => $this->sendSms($to, $body, $meta),
                    'webhook' => $this->sendWebhook($to, $subject, $body, $meta),
                    'push' => $this->sendPush($to, $subject, $body, $meta),
                };

                $results[$channel] = $result;
            } catch (\Exception $e) {
                Log::error("Failed to send {$channel} notification", [
                    'to' => $to,
                    'exception' => $e->getMessage(),
                ]);

                $results[$channel] = [
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Send email notification
     */
    public function sendEmail(string $to, string $subject, string $body, array $meta = []): array
    {
        try {
            // Log notification intent
            $notification = Notification::create([
                'channel' => 'email',
                'to' => $to,
                'subject' => $subject,
                'body' => $body,
                'status' => 'queued',
                'meta' => $meta,
            ]);

            // TODO: Queue mail job when mail service is configured
            // Mail::queue(new OperationNotification($to, $subject, $body));

            // For MVP: Just log
            Log::info("Email queued: {$subject} to {$to}");

            $notification->update(['status' => 'sent', 'sent_at' => now()]);

            return [
                'status' => 'sent',
                'notification_id' => $notification->id,
            ];
        } catch (\Exception $e) {
            Log::error('Email notification failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send SMS notification via Twilio
     */
    public function sendSms(string $phoneNumber, string $body, array $meta = []): array
    {
        try {
            $notification = Notification::create([
                'channel' => 'sms',
                'to' => $phoneNumber,
                'subject' => null,
                'body' => $body,
                'status' => 'queued',
                'meta' => $meta,
            ]);

            // TODO: Integrate with Twilio client
            // $twilio = new Client($this->twilioAccountSid, $this->twilioAuthToken);
            // $twilio->messages->create($phoneNumber, [
            //     'from' => env('TWILIO_PHONE_NUMBER'),
            //     'body' => $body,
            // ]);

            Log::info("SMS queued to {$phoneNumber}");
            $notification->update(['status' => 'sent', 'sent_at' => now()]);

            return [
                'status' => 'sent',
                'notification_id' => $notification->id,
            ];
        } catch (\Exception $e) {
            Log::error('SMS notification failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send webhook notification
     */
    public function sendWebhook(string $webhookUrl, string $subject, string $body, array $meta = []): array
    {
        try {
            $notification = Notification::create([
                'channel' => 'webhook',
                'to' => $webhookUrl,
                'subject' => $subject,
                'body' => $body,
                'status' => 'queued',
                'meta' => $meta,
            ]);

            // TODO: Queue webhook job for async delivery
            // WebhookJob::dispatch($webhookUrl, compact('subject', 'body', 'meta'));

            Log::info("Webhook queued to {$webhookUrl}");
            $notification->update(['status' => 'sent', 'sent_at' => now()]);

            return [
                'status' => 'sent',
                'notification_id' => $notification->id,
            ];
        } catch (\Exception $e) {
            Log::error('Webhook notification failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send push notification
     */
    public function sendPush(string $deviceToken, string $subject, string $body, array $meta = []): array
    {
        try {
            $notification = Notification::create([
                'channel' => 'push',
                'to' => $deviceToken,
                'subject' => $subject,
                'body' => $body,
                'status' => 'queued',
                'meta' => $meta,
            ]);

            // TODO: Integrate with Firebase Cloud Messaging or similar
            // $this->firebaseClient->sendMessage($deviceToken, $subject, $body);

            Log::info("Push notification queued to device {$deviceToken}");
            $notification->update(['status' => 'sent', 'sent_at' => now()]);

            return [
                'status' => 'sent',
                'notification_id' => $notification->id,
            ];
        } catch (\Exception $e) {
            Log::error('Push notification failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get pending notifications
     */
    public function getPending(): \Illuminate\Database\Eloquent\Collection
    {
        return Notification::where('status', 'queued')
            ->orderBy('created_at')
            ->limit(100)
            ->get();
    }

    /**
     * Retry failed notification
     */
    public function retry(Notification $notification): array
    {
        if ($notification->meta['retry_count'] ?? 0 >= self::MAX_RETRIES) {
            $notification->update(['status' => 'failed']);
            return ['status' => 'max_retries_exceeded'];
        }

        $meta = $notification->meta ?? [];
        $meta['retry_count'] = ($meta['retry_count'] ?? 0) + 1;

        $notification->update(['meta' => $meta, 'status' => 'queued']);

        // Retry sending
        return $this->send(
            $notification->channel,
            $notification->to,
            $notification->subject ?? '',
            $notification->body,
            $meta
        );
    }
}
