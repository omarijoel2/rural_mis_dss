<?php

namespace App\Console\Commands;

use App\Models\Cmms\PmTemplate;
use App\Models\Cmms\WorkOrder;
use App\Models\Cmms\Asset;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GeneratePreventiveMaintenance extends Command
{
    protected $signature = 'cmms:generate-pm {--force}';
    protected $description = 'Generate preventive maintenance work orders from templates';

    public function handle(): int
    {
        $this->info('Starting PM generation...');

        $templates = PmTemplate::where('is_active', true)->get();
        $generated = 0;

        foreach ($templates as $template) {
            try {
                // Get assets matching this template
                $assets = Asset::where('class_id', $template->asset_class_id)->get();

                foreach ($assets as $asset) {
                    // Check if WO already exists for this asset and template in the next interval window
                    $dueDateStart = Carbon::now();
                    $dueDateEnd = $dueDateStart->copy()->addDays($template->tolerance_pct ?? 10);

                    $existingWO = WorkOrder::where('asset_id', $asset->id)
                        ->where('job_plan_id', $template->job_plan_id)
                        ->whereBetween('due_at', [$dueDateStart, $dueDateEnd])
                        ->where('status', '!=', 'cancelled')
                        ->first();

                    if ($existingWO) {
                        continue;
                    }

                    // Create new PM work order
                    $dueAt = Carbon::now()->addDays($template->frequency_days);

                    $wo = WorkOrder::create([
                        'tenant_id' => $asset->tenant_id,
                        'asset_id' => $asset->id,
                        'job_plan_id' => $template->job_plan_id,
                        'kind' => 'pm',
                        'priority' => 'medium',
                        'status' => 'new',
                        'description' => "Preventive maintenance for {$asset->name} based on template {$template->name}",
                        'due_at' => $dueAt,
                        'est_labor_h' => $template->est_labor_hours ?? 2,
                        'est_parts_cost' => $template->est_parts_cost ?? 0,
                    ]);

                    $generated++;
                }
            } catch (\Exception $e) {
                $this->error("Error processing template {$template->id}: " . $e->getMessage());
            }
        }

        $this->info("Generated {$generated} PM work orders");
        return Command::SUCCESS;
    }
}
