<?php

namespace App\Jobs\Crm;

use App\Models\User;
use App\Services\Crm\DunningService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DispatchDunningJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $tenantId,
        private int $userId,
        private string $agingBucket
    ) {
    }

    public function handle(DunningService $dunningService): void
    {
        Log::info("Generating dunning notices for tenant {$this->tenantId}, bucket: {$this->agingBucket}");

        $user = User::where('id', $this->userId)
            ->whereHas('tenant', function ($q) {
                $q->where('id', $this->tenantId);
            })
            ->firstOrFail();

        try {
            $notices = $dunningService->generateDunningNotices($this->agingBucket, $user);
            Log::info("Dunning notices generated for tenant {$this->tenantId}: " . count($notices));
        } catch (\Exception $e) {
            Log::error("Dunning dispatch failed for tenant {$this->tenantId}: " . $e->getMessage());
            throw $e;
        }
    }
}
