<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Mobile\SyncPushRequest;
use App\Models\SyncBatch;
use App\Jobs\ProcessSyncBatch;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function push(SyncPushRequest $req)
    {
        $data = $req->validated();

        $batch = SyncBatch::create([
            'batch_token' => (string) \Illuminate\Support\Str::uuid(),
            'device_id' => $data['device_id'],
            'client_sync_token' => $data['client_sync_token'] ?? null,
            'items_count' => count($data['items'] ?? []),
            'status' => 'received',
        ]);

        foreach ($data['items'] as $item) {
            $batch->items()->create([
                'client_temp_id' => $item['client_temp_id'] ?? null,
                'resource_type' => $item['resource_type'],
                'action' => $item['action'],
                'payload' => $item['payload'] ?? null,
                'client_version' => $item['client_version'] ?? null,
            ]);
        }

        // Dispatch background job for processing
        ProcessSyncBatch::dispatch($batch);

        return response()->json(['batch_id' => $batch->id, 'processed_at' => now(), 'results' => []]);
    }

    public function pull(Request $req)
    {
        $since = $req->input('since_token');
        // Placeholder: return empty changes and next_token; real implementation will compute deltas
        return response()->json(['next_token' => (string) \Illuminate\Support\Str::uuid(), 'changes' => []]);
    }

    public function ack(Request $req)
    {
        // Accept ack_token and mark batches as delivered
        return response()->json(['ok' => true]);
    }
}
