<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class NotificationController extends IntegrationBaseController
{
    public function createChannel() { return response()->json(['message' => 'Notification channel created']); }
    public function send() { return response()->json(['message' => 'Notification sent']); }
    public function createTemplate() { return response()->json(['message' => 'Notification template created']); }
    public function queue() { return response()->json(['message' => 'Notification queue']); }
}
