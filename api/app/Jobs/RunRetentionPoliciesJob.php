<?php

namespace App\Jobs;

use App\Services\RetentionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RunRetentionPoliciesJob implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function handle(RetentionService $retentionService): void
    {
        $results = $retentionService->applyPolicies();

        \Log::info('Retention policies applied', ['results' => $results]);
    }
}
