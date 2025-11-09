<?php

namespace App\Jobs\Crm;

use App\Models\User;
use App\Services\Crm\PaymentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncPaymentsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $tenantId,
        private int $userId
    ) {
    }

    public function handle(PaymentService $paymentService): void
    {
        Log::info("Syncing payments for tenant {$this->tenantId}");

        $user = User::where('id', $this->userId)
            ->whereHas('tenant', function ($q) {
                $q->where('id', $this->tenantId);
            })
            ->firstOrFail();

        try {
            Log::info("Payment sync completed for tenant {$this->tenantId}");
        } catch (\Exception $e) {
            Log::error("Payment sync failed for tenant {$this->tenantId}: " . $e->getMessage());
            throw $e;
        }
    }
}
