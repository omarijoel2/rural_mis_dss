<?php

namespace App\Jobs;

use App\Models\SyncBatch;
use App\Models\SyncItem;
use App\Models\Conflict;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessSyncBatch implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    protected $batch;

    public function __construct(SyncBatch $batch)
    {
        $this->batch = $batch;
    }

    public function handle()
    {
        $this->batch->update(['status' => 'processing']);

        // Use SyncProcessor service to process each item and persist per-item results
        $processor = app(\App\Services\Mobile\SyncProcessor::class);

        foreach ($this->batch->items as $item) {
            try {
                $result = $processor->processItem($item);

                // Normalize result
                $status = $result['status'] ?? 'error';
                $serverId = $result['server_id'] ?? null;
                $serverVersion = $result['server_version'] ?? null;
                $error = $result['error'] ?? null;

                $item->update([
                    'status' => $status,
                    'error_message' => $error,
                    'server_version' => $serverVersion,
                    'server_id' => $serverId,
                ]);

                // If conflict was created inside processor, ensure the client is notified via a conflict record (processor handles creation)
            } catch (\Exception $e) {
                $item->update(['status' => 'error', 'error_message' => $e->getMessage()]);
            }
        }

        $this->batch->update(['status' => 'completed', 'processed_at' => now()]);
    }
}
