<?php

namespace App\Jobs;

use App\Services\AuditService;
use App\Services\SecurityAlertService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessSecurityAlertsJob implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function handle(AuditService $auditService, SecurityAlertService $alertService): void
    {
        $tenants = \App\Models\Tenant::where('is_active', true)->get();

        $totalPatterns = 0;

        foreach ($tenants as $tenant) {
            try {
                $patterns = $auditService->detectSuspiciousActivity(null, $tenant->id);

                foreach ($patterns as $pattern) {
                    if (!isset($pattern['tenant_id'])) {
                        \Log::warning('Skipping pattern without tenant_id', ['pattern' => $pattern]);
                        continue;
                    }

                    $alertService->createAlert(
                        $pattern['type'],
                        'high',
                        'Suspicious Activity Detected',
                        'Suspicious activity pattern detected: ' . $pattern['type'],
                        $pattern,
                        $pattern['tenant_id']
                    );

                    $totalPatterns++;
                }
            } catch (\Exception $e) {
                \Log::error('Error processing security alerts for tenant', [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        \Log::info('Security alerts processed', ['patterns_detected' => $totalPatterns]);
    }
}
