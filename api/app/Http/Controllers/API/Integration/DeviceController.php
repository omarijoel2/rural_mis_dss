<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class DeviceController extends IntegrationBaseController
{
    public function register() { return response()->json(['message' => 'Device registered']); }
    public function index() { return response()->json(['message' => 'Device list']); }
    public function destroy($id) { return response()->json(['message' => "Device $id deleted"]); }
    public function queueSync($device) { return response()->json(['message' => "Sync queued for device $device"]); }
    public function pendingSync($device) { return response()->json(['message' => "Pending sync for device $device"]); }
    public function completeSync($syncOp) { return response()->json(['message' => "Sync op $syncOp completed"]); }
    public function resolveConflict($syncOp) { return response()->json(['message' => "Sync conflict $syncOp resolved"]); }
}
