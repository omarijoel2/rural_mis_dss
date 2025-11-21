<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toWebhook')) {
            return;
        }

        $data = $notification->toWebhook($notifiable);
        
        $url = $data['url'] ?? null;
        $payload = $data['payload'] ?? [];

        if (!$url) {
            Log::warning('Webhook notification skipped: No URL provided', [
                'notification' => get_class($notification),
                'notifiable' => get_class($notifiable),
            ]);
            return;
        }

        try {
            $response = Http::timeout(10)
                ->retry(3, 1000)
                ->post($url, $payload);

            if ($response->failed()) {
                Log::error('Webhook notification failed', [
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Webhook notification exception', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
