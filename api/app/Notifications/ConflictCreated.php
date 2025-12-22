<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Queue\ShouldQueue;

class ConflictCreated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $conflict;

    public function __construct($conflict)
    {
        $this->conflict = $conflict;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'conflict.created',
            'conflict_id' => $this->conflict->id,
            'resource_type' => $this->conflict->resource_type,
            'resource_id' => $this->conflict->resource_id,
            'server_payload' => $this->conflict->server_payload,
            'client_payload' => $this->conflict->client_payload,
            'created_at' => $this->conflict->created_at?->toIso8601String(),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }

    public function toArray($notifiable)
    {
        return $this->toDatabase($notifiable);
    }
}
