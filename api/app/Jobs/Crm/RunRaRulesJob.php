<?php

namespace App\Jobs\Crm;

use App\Models\User;
use App\Services\Crm\RaEngineService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RunRaRulesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $tenantId,
        private int $userId
    ) {
    }

    public function handle(RaEngineService $raEngineService): void
    {
        Log::info("Running RA rules for tenant {$this->tenantId}");

        $user = User::where('id', $this->userId)
            ->whereHas('tenant', function ($q) {
                $q->where('id', $this->tenantId);
            })
            ->firstOrFail();

        try {
            $result = $raEngineService->runAllRules($user);
            Log::info("RA rules completed for tenant {$this->tenantId}: {$result['new_cases']} new cases created");
        } catch (\Exception $e) {
            Log::error("RA rules failed for tenant {$this->tenantId}: " . $e->getMessage());
            throw $e;
        }
    }
}
