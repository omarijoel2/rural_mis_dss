<?php

namespace App\Console\Commands;

use App\Models\Cmms\WorkOrder;
use App\Models\Cmms\SlaPolicy;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckSlaBreaches extends Command
{
    protected $signature = 'cmms:check-sla-breaches';
    protected $description = 'Check for SLA breaches and escalate if needed';

    public function handle(): int
    {
        $this->info('Checking SLA breaches...');

        $breachCount = 0;

        // Find work orders with SLA policies that are overdue
        $workOrders = WorkOrder::with('slaPolicies')
            ->whereIn('status', ['assigned', 'in_progress'])
            ->where('due_at', '<', Carbon::now())
            ->get();

        foreach ($workOrders as $wo) {
            if ($wo->slaPolicies->isEmpty()) {
                continue;
            }

            foreach ($wo->slaPolicies as $slaPolicy) {
                $targetTime = $wo->created_at->addMinutes($slaPolicy->resolution_target_minutes);

                if (Carbon::now()->greaterThan($targetTime) && !$wo->sla_breached_at) {
                    // Mark as breached
                    $wo->update([
                        'sla_breached_at' => Carbon::now(),
                        'sla_breach_reason' => "Exceeded {$slaPolicy->resolution_target_minutes} minute resolution target",
                    ]);

                    // Log escalation
                    $wo->addActivityLog('SLA Breach', "SLA target of {$slaPolicy->resolution_target_minutes} minutes exceeded");

                    $breachCount++;
                }
            }
        }

        $this->info("Found {$breachCount} SLA breaches");
        return Command::SUCCESS;
    }
}
