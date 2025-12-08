<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Scheme;
use App\Models\Dma;
use App\Models\Asset;
use App\Models\Organization;

class CoreOpsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting Core Operations seeder...');

        $org = Organization::first();
        if (!$org) {
            $this->command->error('No organization found. Run other seeders first.');
            return;
        }

        $schemes = Scheme::take(5)->get();
        if ($schemes->isEmpty()) {
            $this->command->error('No schemes found. Run SchemeSeeder first.');
            return;
        }

        $this->seedNetworkNodes($schemes);
        $this->seedNetworkEdges();
        
        // Skip telemetry if already seeded
        if (DB::table('telemetry_tags')->count() < 30) {
            $this->seedTelemetryTags($schemes);
        } else {
            $this->command->info('Telemetry tags already seeded. Skipping.');
        }
        
        $this->seedNrwSnapshots($schemes);
        $this->seedOutages($schemes);
        $this->seedDosingPlans($schemes);
        $this->seedDoseChangeLogs();
        $this->seedPumpSchedules();

        $this->command->info('Core Operations seeder completed!');
    }

    protected function seedNetworkNodes($schemes): void
    {
        $nodeTypes = ['source', 'wtp', 'reservoir', 'junction', 'customer_node', 'valve', 'pump'];
        $nodesCreated = 0;

        foreach ($schemes as $scheme) {
            $tenantId = $scheme->tenant_id ?? Organization::first()->id;
            
            foreach ($nodeTypes as $index => $type) {
                $code = strtoupper($scheme->code) . '-' . strtoupper(substr($type, 0, 3)) . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);
                
                $existingCount = DB::table('network_nodes')
                    ->where('code', $code)
                    ->count();

                if ($existingCount == 0) {
                    $baseLat = 3.1 + ($index * 0.01);
                    $baseLng = 35.6 + ($index * 0.01);

                    DB::table('network_nodes')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'scheme_id' => $scheme->id,
                        'code' => $code,
                        'name' => ucfirst($type) . ' Node - ' . $scheme->name,
                        'type' => $type,
                        'elevation_m' => rand(100, 300),
                        'props' => json_encode([
                            'capacity_m3h' => rand(50, 500),
                        ]),
                        'geom' => DB::raw("ST_SetSRID(ST_MakePoint($baseLng, $baseLat), 4326)"),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $nodesCreated++;
                }
            }
        }

        $this->command->info("Created $nodesCreated network nodes.");
    }

    protected function seedNetworkEdges(): void
    {
        $nodes = DB::table('network_nodes')->get();
        $edgesCreated = 0;

        $nodesByScheme = $nodes->groupBy('scheme_id');

        foreach ($nodesByScheme as $schemeId => $schemeNodes) {
            $nodeList = $schemeNodes->values();
            $tenantId = $nodeList->first()->tenant_id ?? Organization::first()->id;
            
            for ($i = 0; $i < count($nodeList) - 1; $i++) {
                $fromNode = $nodeList[$i];
                $toNode = $nodeList[$i + 1];

                $exists = DB::table('network_edges')
                    ->where('from_node_id', $fromNode->id)
                    ->where('to_node_id', $toNode->id)
                    ->exists();

                if (!$exists) {
                    $diameter = [110, 160, 200, 250, 315][rand(0, 4)];
                    $material = ['HDPE', 'uPVC', 'DI', 'GI'][rand(0, 3)];
                    $length = rand(100, 2000);
                    
                    DB::table('network_edges')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'scheme_id' => $schemeId,
                        'from_node_id' => $fromNode->id,
                        'to_node_id' => $toNode->id,
                        'type' => 'pipe',
                        'material' => $material,
                        'diameter_mm' => $diameter,
                        'length_m' => $length,
                        'status' => 'active',
                        'props' => json_encode(['install_method' => 'trench']),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $edgesCreated++;
                }
            }
        }

        $this->command->info("Created $edgesCreated network edges.");
    }

    protected function seedTelemetryTags($schemes): void
    {
        $tagConfigs = [
            ['tag' => 'FLOW_IN', 'io_type' => 'AI', 'unit' => 'm3/h'],
            ['tag' => 'FLOW_OUT', 'io_type' => 'AI', 'unit' => 'm3/h'],
            ['tag' => 'PRESSURE_IN', 'io_type' => 'AI', 'unit' => 'bar'],
            ['tag' => 'PRESSURE_OUT', 'io_type' => 'AI', 'unit' => 'bar'],
            ['tag' => 'LEVEL', 'io_type' => 'AI', 'unit' => 'm'],
            ['tag' => 'CHLORINE', 'io_type' => 'AI', 'unit' => 'mg/L'],
            ['tag' => 'TURBIDITY', 'io_type' => 'AI', 'unit' => 'NTU'],
            ['tag' => 'PUMP_STATUS', 'io_type' => 'DI', 'unit' => 'bool'],
            ['tag' => 'VALVE_POS', 'io_type' => 'AO', 'unit' => '%'],
            ['tag' => 'POWER_KW', 'io_type' => 'AI', 'unit' => 'kW'],
        ];

        $tagsCreated = 0;
        $assets = Asset::take(20)->get();

        foreach ($schemes as $scheme) {
            $tenantId = $scheme->tenant_id ?? Organization::first()->id;
            
            foreach ($tagConfigs as $config) {
                $tagName = $scheme->code . '_' . $config['tag'];
                
                $exists = DB::table('telemetry_tags')->where('tag', $tagName)->exists();
                if (!$exists) {
                    $asset = $assets->random();
                    
                    DB::table('telemetry_tags')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'tag' => $tagName,
                        'io_type' => $config['io_type'],
                        'unit' => $config['unit'],
                        'scale' => json_encode(['min' => 0, 'max' => 100, 'offset' => 0]),
                        'thresholds' => json_encode([
                            'low_low' => 10,
                            'low' => 20,
                            'high' => 80,
                            'high_high' => 90,
                        ]),
                        'asset_id' => $asset->id,
                        'scheme_id' => $scheme->id,
                        'enabled' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $tagsCreated++;

                    $tagId = DB::table('telemetry_tags')->where('tag', $tagName)->value('id');
                    for ($i = 0; $i < 6; $i++) {
                        DB::table('telemetry_measurements')->insert([
                            'id' => Str::uuid(),
                            'telemetry_tag_id' => $tagId,
                            'ts' => now()->subHours($i * 4),
                            'value' => rand(20, 80) + (rand(0, 100) / 100),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        $this->command->info("Created $tagsCreated telemetry tags with measurements.");
    }

    protected function seedNrwSnapshots($schemes): void
    {
        $dmas = Dma::take(10)->get();
        $snapshotsCreated = 0;
        $tenantId = DB::table('tenants')->first()->id;

        foreach ($dmas as $dma) {
            for ($month = 1; $month <= 6; $month++) {
                $asOf = now()->subMonths($month)->startOfMonth();
                
                $exists = DB::table('nrw_snapshots')
                    ->where('dma_id', $dma->id)
                    ->whereDate('as_of', $asOf)
                    ->exists();

                if (!$exists) {
                    $systemInput = rand(5000, 20000);
                    $billedAuth = $systemInput * (rand(60, 80) / 100);
                    $unbilledAuth = $systemInput * 0.02;
                    $apparentLoss = $systemInput * (rand(5, 15) / 100);
                    $realLoss = $systemInput - $billedAuth - $unbilledAuth - $apparentLoss;
                    $nrw = $systemInput - $billedAuth;

                    DB::table('nrw_snapshots')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'dma_id' => $dma->id,
                        'as_of' => $asOf,
                        'system_input_volume_m3' => $systemInput,
                        'billed_authorized_m3' => $billedAuth,
                        'unbilled_authorized_m3' => $unbilledAuth,
                        'apparent_losses_m3' => $apparentLoss,
                        'real_losses_m3' => $realLoss,
                        'nrw_m3' => $nrw,
                        'nrw_pct' => ($nrw / $systemInput) * 100,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $snapshotsCreated++;
                }
            }
        }

        $this->seedInterventions($dmas);
        $this->command->info("Created $snapshotsCreated NRW snapshots.");
    }

    protected function seedInterventions($dmas): void
    {
        $interventionTypes = ['leak_repair', 'meter_replacement', 'prv_tuning', 'sectorization', 'campaign', 'other'];
        $interventionsCreated = 0;
        $tenantId = DB::table('tenants')->first()->id;

        foreach ($dmas->take(5) as $dma) {
            foreach ($interventionTypes as $type) {
                $exists = DB::table('interventions')
                    ->where('dma_id', $dma->id)
                    ->where('type', $type)
                    ->exists();

                if (!$exists) {
                    DB::table('interventions')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'dma_id' => $dma->id,
                        'type' => $type,
                        'date' => now()->subDays(rand(10, 60)),
                        'estimated_savings_m3d' => rand(10, 100),
                        'realized_savings_m3d' => rand(5, 80),
                        'cost' => rand(50000, 500000),
                        'responsible' => 'Operations Team',
                        'notes' => ucfirst(str_replace('_', ' ', $type)) . ' intervention in ' . $dma->name,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $interventionsCreated++;
                }
            }
        }

        $this->command->info("Created $interventionsCreated interventions.");
    }

    protected function seedOutages($schemes): void
    {
        $causes = ['planned', 'fault', 'water_quality', 'power', 'other'];
        $states = ['draft', 'approved', 'live', 'restored', 'post_mortem', 'closed'];
        $outagesCreated = 0;
        $tenantId = DB::table('tenants')->first()->id;

        foreach ($schemes as $scheme) {
            for ($i = 0; $i < 3; $i++) {
                $cause = $causes[array_rand($causes)];
                $state = $states[array_rand($states)];
                $code = strtoupper($scheme->code) . '-OUT-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT);

                $exists = DB::table('outages')->where('code', $code)->exists();
                if ($exists) continue;

                $startAt = now()->subDays(rand(1, 30))->subHours(rand(0, 12));
                $endAt = $startAt->copy()->addHours(rand(2, 48));
                $actualRestored = in_array($state, ['resolved', 'closed']) ? $endAt : null;

                DB::table('outages')->insert([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenantId,
                    'scheme_id' => $scheme->id,
                    'code' => $code,
                    'cause' => $cause,
                    'state' => $state,
                    'summary' => ucfirst($cause) . ' outage affecting ' . $scheme->name . ' water supply.',
                    'estimated_customers_affected' => rand(500, 10000),
                    'actual_customers_affected' => rand(400, 9000),
                    'starts_at' => $startAt,
                    'ends_at' => $endAt,
                    'actual_restored_at' => $actualRestored,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $outagesCreated++;
            }
        }

        $this->command->info("Created $outagesCreated outages.");
    }

    protected function seedDosingPlans($schemes): void
    {
        $chemicals = ['chlorine', 'alum', 'lime', 'pac', 'polymer'];
        $plansCreated = 0;
        $tenantId = DB::table('tenants')->first()->id;

        foreach ($schemes->take(3) as $scheme) {
            $assets = Asset::where('scheme_id', $scheme->id)->take(2)->get();

            foreach ($assets as $asset) {
                $chemical = $chemicals[array_rand($chemicals)];

                $exists = DB::table('dose_plans')
                    ->where('scheme_id', $scheme->id)
                    ->where('asset_id', $asset->id)
                    ->exists();

                if (!$exists) {
                    DB::table('dose_plans')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'scheme_id' => $scheme->id,
                        'asset_id' => $asset->id,
                        'chemical' => $chemical,
                        'flow_bands' => json_encode([
                            ['min_lps' => 0, 'max_lps' => 50, 'target_mg_l' => 0.5],
                            ['min_lps' => 50, 'max_lps' => 100, 'target_mg_l' => 0.8],
                            ['min_lps' => 100, 'max_lps' => 200, 'target_mg_l' => 1.0],
                        ]),
                        'thresholds' => json_encode([
                            'low_alarm' => 0.2,
                            'high_alarm' => 1.5,
                        ]),
                        'active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $plansCreated++;
                }
            }
        }

        $this->seedChemicalStocks($schemes);
        $this->command->info("Created $plansCreated dose plans.");
    }

    protected function seedChemicalStocks($schemes): void
    {
        $chemicals = ['chlorine', 'alum', 'lime', 'pac'];
        $stocksCreated = 0;
        $tenantId = DB::table('tenants')->first()->id;

        foreach ($schemes->take(3) as $scheme) {
            foreach ($chemicals as $chemical) {
                $exists = DB::table('chemical_stocks')
                    ->where('scheme_id', $scheme->id)
                    ->where('chemical', $chemical)
                    ->exists();

                if (!$exists) {
                    DB::table('chemical_stocks')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'scheme_id' => $scheme->id,
                        'chemical' => $chemical,
                        'qty_on_hand_kg' => rand(100, 1000),
                        'unit_cost' => rand(50, 500),
                        'reorder_level_kg' => rand(50, 200),
                        'max_stock_kg' => rand(1500, 3000),
                        'as_of' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $stocksCreated++;
                }
            }
        }

        $this->command->info("Created $stocksCreated chemical stocks.");
    }

    protected function seedDoseChangeLogs(): void
    {
        $dosePlans = DB::table('dose_plans')->take(5)->get();
        $users = DB::table('users')->take(3)->get();
        $logsCreated = 0;

        if ($dosePlans->isEmpty() || $users->isEmpty()) {
            $this->command->warn("No dose plans or users found. Skipping dose change logs.");
            return;
        }

        $changeTypes = [
            ['field' => 'target_mg_l', 'before' => '0.5', 'after' => '0.8', 'reason' => 'Increased turbidity detected in source water'],
            ['field' => 'target_mg_l', 'before' => '1.0', 'after' => '1.2', 'reason' => 'Seasonal adjustment for summer demand'],
            ['field' => 'flow_band', 'before' => '10-50 L/s', 'after' => '15-60 L/s', 'reason' => 'Pump capacity upgrade completed'],
            ['field' => 'chemical', 'before' => 'Chlorine Gas', 'after' => 'Sodium Hypochlorite', 'reason' => 'Safety compliance requirement'],
            ['field' => 'min_residual', 'before' => '0.2', 'after' => '0.3', 'reason' => 'WHO guideline update'],
            ['field' => 'max_residual', 'before' => '1.5', 'after' => '1.2', 'reason' => 'Customer complaints about taste'],
            ['field' => 'active', 'before' => 'true', 'after' => 'false', 'reason' => 'Asset under maintenance'],
            ['field' => 'active', 'before' => 'false', 'after' => 'true', 'reason' => 'Maintenance completed, resuming operation'],
        ];

        foreach ($dosePlans as $index => $plan) {
            $numChanges = rand(1, 3);
            
            for ($i = 0; $i < $numChanges; $i++) {
                $change = $changeTypes[array_rand($changeTypes)];
                $user = $users->random();

                $exists = DB::table('dose_change_logs')
                    ->where('dose_plan_id', $plan->id)
                    ->where('reason', $change['reason'])
                    ->exists();

                if (!$exists) {
                    DB::table('dose_change_logs')->insert([
                        'id' => Str::uuid(),
                        'dose_plan_id' => $plan->id,
                        'user_id' => $user->id,
                        'before' => json_encode([$change['field'] => $change['before']]),
                        'after' => json_encode([$change['field'] => $change['after']]),
                        'reason' => $change['reason'],
                        'created_at' => now()->subDays(rand(1, 30))->subHours(rand(0, 23)),
                        'updated_at' => now(),
                    ]);
                    $logsCreated++;
                }
            }
        }

        $this->command->info("Created $logsCreated dose change logs.");
    }

    protected function seedPumpSchedules(): void
    {
        // Get assets that have a scheme_id 
        $pumps = Asset::whereNotNull('scheme_id')->take(10)->get();

        if ($pumps->isEmpty()) {
            $this->command->warn("No assets with scheme_id found. Skipping pump schedules.");
            return;
        }

        $schedulesCreated = 0;
        $tenantId = DB::table('tenants')->first()->id;

        foreach ($pumps as $pump) {
            if (!$pump->scheme_id) continue;
            
            for ($day = 0; $day < 7; $day++) {
                $startAt = now()->addDays($day)->setHour(rand(6, 10))->setMinute(0);
                $endAt = $startAt->copy()->addHours(rand(4, 12));

                $exists = DB::table('pump_schedules')
                    ->where('asset_id', $pump->id)
                    ->whereDate('start_at', $startAt->toDateString())
                    ->exists();

                if (!$exists) {
                    $targetVol = rand(500, 2000);
                    $actualVol = rand(0, 1) ? rand(400, 1800) : null;
                    
                    DB::table('pump_schedules')->insert([
                        'id' => Str::uuid(),
                        'tenant_id' => $tenantId,
                        'asset_id' => $pump->id,
                        'scheme_id' => $pump->scheme_id,
                        'start_at' => $startAt,
                        'end_at' => $endAt,
                        'constraints' => json_encode([
                            'reservoir_min_level' => rand(2, 4),
                            'reservoir_max_level' => rand(8, 10),
                            'tariff_band' => ['off_peak', 'standard', 'peak'][rand(0, 2)],
                        ]),
                        'source' => ['manual', 'optimizer'][rand(0, 1)],
                        'target_volume_m3' => $targetVol,
                        'actual_volume_m3' => $actualVol,
                        'energy_cost' => $actualVol ? $actualVol * 0.15 : null,
                        'status' => ['scheduled', 'running', 'completed', 'cancelled'][rand(0, 3)],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $schedulesCreated++;
                }
            }
        }

        $this->command->info("Created $schedulesCreated pump schedules.");
    }
}
