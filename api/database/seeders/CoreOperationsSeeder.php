<?php

namespace Database\Seeders;

use App\Models\TelemetryTag;
use App\Models\TelemetryMeasurement;
use App\Models\NrwSnapshot;
use App\Models\Intervention;
use App\Models\Outage;
use App\Models\DosePlan;
use App\Models\ChemicalStock;
use App\Models\PumpSchedule;
use App\Models\NetworkNode;
use App\Models\Scheme;
use App\Models\Facility;
use App\Models\Asset;
use App\Models\Dma;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Objects\MultiPolygon;

class CoreOperationsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        if (!$tenant) {
            $this->command->warn('No tenant found. Run CoreRegistrySeeder first.');
            return;
        }

        $tenantId = $tenant->id;
        $scheme = Scheme::where('tenant_id', $tenantId)->first();
        $dmas = Dma::where('tenant_id', $tenantId)->get();
        $facilities = Facility::where('tenant_id', $tenantId)->get();
        $assets = Asset::where('tenant_id', $tenantId)->get();

        if (!$scheme || $dmas->isEmpty() || $facilities->isEmpty()) {
            $this->command->warn('Missing core registry data. Run CoreRegistrySeeder first.');
            return;
        }

        $this->command->info('Truncating existing Core Operations data for idempotent seeding...');
        DB::table('telemetry_measurements')->truncate();
        DB::table('telemetry_tags')->delete();
        DB::table('nrw_snapshots')->delete();
        DB::table('interventions')->delete();
        DB::table('outages')->delete();
        DB::table('dose_plans')->delete();
        DB::table('chemical_stocks')->delete();
        DB::table('pump_schedules')->delete();
        DB::table('network_nodes')->delete();

        $this->command->info('Seeding Core Operations data...');

        $this->seedNetworkNodes($tenantId, $scheme->id, $facilities);
        $this->seedTelemetryTags($tenantId, $scheme->id, $facilities, $assets);
        $this->seedTelemetryMeasurements();
        $this->seedNrwSnapshots($tenantId, $scheme->id, $dmas);
        $this->seedInterventions($tenantId, $scheme->id, $dmas);
        $this->seedOutages($tenantId, $scheme->id, $dmas);
        $this->seedDosePlans($tenantId, $facilities);
        $this->seedChemicalStocks($tenantId, $facilities);
        $this->seedPumpSchedules($tenantId, $facilities, $assets);

        $this->command->info('Core Operations data seeded successfully!');
    }

    private function seedNetworkNodes($tenantId, $schemeId, $facilities): void
    {
        $this->command->info('Creating network nodes...');

        foreach ($facilities as $facility) {
            $nodeType = match ($facility->facility_type) {
                'source' => 'source',
                'treatment_plant' => 'wtp',
                'reservoir' => 'reservoir',
                'pumping_station' => 'pump',
                default => 'junction',
            };

            NetworkNode::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'tenant_id' => $tenantId,
                'scheme_id' => $schemeId,
                'type' => $nodeType,
                'code' => $facility->code . '_NODE',
                'elevation_m' => rand(1200, 1800),
                'geom' => $facility->geom ?? new Point(36.817 + rand(-10, 10) / 1000, -1.286 + rand(-10, 10) / 1000, 4326),
            ]);
        }
    }

    private function seedTelemetryTags($tenantId, $schemeId, $facilities, $assets): void
    {
        $this->command->info('Creating telemetry tags...');

        $tagConfigs = [
            ['tag' => 'SCADA.PS1.FLOW_IN', 'io_type' => 'AI', 'unit' => 'm3/h', 'category' => 'flow'],
            ['tag' => 'SCADA.PS1.PRESSURE_IN', 'io_type' => 'AI', 'unit' => 'bar', 'category' => 'pressure'],
            ['tag' => 'SCADA.PS1.PUMP1_STATUS', 'io_type' => 'DI', 'unit' => null, 'category' => 'pump_status'],
            ['tag' => 'SCADA.PS1.PUMP1_POWER', 'io_type' => 'AI', 'unit' => 'kW', 'category' => 'power'],
            ['tag' => 'SCADA.RES1.LEVEL', 'io_type' => 'AI', 'unit' => 'm', 'category' => 'level'],
            ['tag' => 'SCADA.WTP1.CHLORINE', 'io_type' => 'AI', 'unit' => 'mg/L', 'category' => 'chlorine'],
            ['tag' => 'SCADA.WTP1.TURBIDITY', 'io_type' => 'AI', 'unit' => 'NTU', 'category' => 'turbidity'],
            ['tag' => 'SCADA.WTP1.PH', 'io_type' => 'AI', 'unit' => 'pH', 'category' => 'ph'],
        ];

        foreach ($tagConfigs as $config) {
            $facility = $facilities->random();
            $asset = $assets->where('facility_id', $facility->id)->first();

            TelemetryTag::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'tenant_id' => $tenantId,
                'scheme_id' => $schemeId,
                'asset_id' => $asset?->id,
                'tag' => $config['tag'],
                'io_type' => $config['io_type'],
                'unit' => $config['unit'],
                'scale' => ['min' => 0, 'max' => 100],
                'thresholds' => ['lo' => 10, 'loLo' => 5, 'hi' => 85, 'hiHi' => 95],
                'enabled' => true,
            ]);
        }
    }

    private function seedTelemetryMeasurements(): void
    {
        $this->command->info('Creating telemetry measurements (time-series data)...');

        $tags = TelemetryTag::all();
        $now = Carbon::now();

        foreach ($tags as $tag) {
            for ($i = 0; $i < 12; $i++) {
                $timestamp = $now->copy()->subHours($i);
                
                $baseValue = match ($tag->io_type) {
                    'AI' => match (true) {
                        str_contains($tag->tag, 'FLOW') => rand(20, 80) + (rand(0, 100) / 100),
                        str_contains($tag->tag, 'PRESSURE') => rand(2, 6) + (rand(0, 100) / 100),
                        str_contains($tag->tag, 'POWER') => rand(10, 45) + (rand(0, 100) / 100),
                        str_contains($tag->tag, 'LEVEL') => rand(2, 8) + (rand(0, 100) / 100),
                        str_contains($tag->tag, 'CHLORINE') => rand(5, 15) / 10,
                        str_contains($tag->tag, 'TURBIDITY') => rand(1, 5) + (rand(0, 100) / 100),
                        str_contains($tag->tag, 'PH') => rand(68, 78) / 10,
                        default => rand(0, 100),
                    },
                    'DI' => rand(0, 1),
                    default => rand(0, 100),
                };

                TelemetryMeasurement::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'telemetry_tag_id' => $tag->id,
                    'ts' => $timestamp,
                    'value' => $baseValue,
                    'meta' => ['quality' => 192, 'source' => 'scada'],
                ]);
            }
        }
    }

    private function seedNrwSnapshots($tenantId, $schemeId, $dmas): void
    {
        $this->command->info('Creating NRW snapshots...');

        foreach ($dmas as $dma) {
            for ($month = 0; $month < 6; $month++) {
                $periodStart = Carbon::now()->subMonths($month)->startOfMonth();
                $periodEnd = $periodStart->copy()->endOfMonth();

                $systemInput = rand(8000, 15000);
                $billedMetered = $systemInput * (rand(60, 75) / 100);
                $billedUnmetered = $systemInput * (rand(5, 10) / 100);
                $unbilledAuthorized = $systemInput * (rand(2, 5) / 100);
                $authorizedConsumption = $billedMetered + $billedUnmetered + $unbilledAuthorized;
                $waterLosses = $systemInput - $authorizedConsumption;
                $apparentLosses = $waterLosses * (rand(30, 40) / 100);
                $realLosses = $waterLosses - $apparentLosses;
                $nrw = $waterLosses;
                $nrwPct = ($nrw / $systemInput) * 100;

                NrwSnapshot::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'tenant_id' => $tenantId,
                    'dma_id' => $dma->id,
                    'as_of' => $periodEnd,
                    'system_input_volume_m3' => $systemInput,
                    'billed_authorized_m3' => $billedMetered + $billedUnmetered,
                    'unbilled_authorized_m3' => $unbilledAuthorized,
                    'apparent_losses_m3' => $apparentLosses,
                    'real_losses_m3' => $realLosses,
                    'nrw_m3' => $nrw,
                    'nrw_pct' => round($nrwPct, 2),
                ]);
            }
        }
    }

    private function seedInterventions($tenantId, $schemeId, $dmas): void
    {
        $this->command->info('Creating NRW interventions...');

        $interventionTypes = ['leak_repair', 'meter_replacement', 'prv_tuning', 'sectorization', 'campaign'];
        
        foreach ($dmas as $dma) {
            for ($i = 0; $i < rand(2, 5); $i++) {
                $type = $interventionTypes[array_rand($interventionTypes)];
                $implementedDate = Carbon::now()->subDays(rand(10, 180));
                
                $cost = match ($type) {
                    'leak_repair' => rand(5000, 15000),
                    'meter_replacement' => rand(3000, 8000),
                    'prv_tuning' => rand(2000, 5000),
                    'sectorization' => rand(10000, 25000),
                    'campaign' => rand(2000, 8000),
                    default => rand(5000, 10000),
                };

                $savingsM3Day = match ($type) {
                    'leak_repair' => rand(50, 200),
                    'meter_replacement' => rand(10, 50),
                    'prv_tuning' => rand(30, 100),
                    'sectorization' => rand(100, 300),
                    'campaign' => rand(20, 80),
                    default => rand(50, 150),
                };

                Intervention::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'tenant_id' => $tenantId,
                    'dma_id' => $dma->id,
                    'type' => $type,
                    'date' => $implementedDate,
                    'estimated_savings_m3d' => $savingsM3Day,
                    'realized_savings_m3d' => $implementedDate->diffInDays(Carbon::now()) > 30 ? $savingsM3Day * (rand(80, 120) / 100) : null,
                    'cost' => $cost,
                    'responsible' => 'Operations Team',
                    'notes' => ucfirst(str_replace('_', ' ', $type)) . ' in ' . $dma->name,
                ]);
            }
        }
    }

    private function seedOutages($tenantId, $schemeId, $dmas): void
    {
        $this->command->info('Creating outages...');

        $reasons = ['Pipe burst repair', 'Pump maintenance', 'Valve replacement', 'Tank cleaning', 'Emergency leak repair'];
        $states = ['draft', 'scheduled', 'in_progress', 'completed'];

        foreach ($dmas->take(3) as $dma) {
            for ($i = 0; $i < rand(1, 3); $i++) {
                $state = $states[array_rand($states)];
                $type = rand(0, 100) > 70 ? 'emergency' : 'planned';
                $scheduledStart = $type === 'planned' ? Carbon::now()->addDays(rand(1, 30)) : Carbon::now()->subHours(rand(1, 6));
                $scheduledEnd = $scheduledStart->copy()->addHours(rand(4, 12));

                Outage::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'tenant_id' => $tenantId,
                    'dma_id' => $dma->id,
                    'code' => 'OUT-' . strtoupper(\Illuminate\Support\Str::random(6)),
                    'cause' => $reasons[array_rand($reasons)],
                    'state' => $state,
                    'starts_at' => $scheduledStart,
                    'ends_at' => $scheduledEnd,
                    'actual_restored_at' => $state === 'completed' ? $scheduledEnd->copy()->addMinutes(rand(-30, 60)) : null,
                    'customers_affected' => rand(50, 500),
                    'geom' => new Polygon([
                        new LineString([
                            new Point(36.817, -1.286, 4326),
                            new Point(36.818, -1.286, 4326),
                            new Point(36.818, -1.287, 4326),
                            new Point(36.817, -1.287, 4326),
                            new Point(36.817, -1.286, 4326),
                        ]),
                    ], 4326),
                ]);
            }
        }
    }

    private function seedDosePlans($tenantId, $facilities): void
    {
        $this->command->info('Creating dose plans...');

        $wtpFacilities = $facilities->where('facility_type', 'treatment_plant');

        foreach ($wtpFacilities as $facility) {
            DosePlan::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'tenant_id' => $tenantId,
                'scheme_id' => $facility->scheme_id,
                'asset_id' => null,
                'chemical' => 'HTH',
                'flow_bands' => [
                    ['min_flow' => 0, 'max_flow' => 50, 'dose_rate' => 1.2],
                    ['min_flow' => 51, 'max_flow' => 100, 'dose_rate' => 1.5],
                    ['min_flow' => 101, 'max_flow' => 150, 'dose_rate' => 1.8],
                ],
                'thresholds' => ['min_residual' => 0.5, 'target_residual' => 0.8, 'max_residual' => 1.2],
                'active' => true,
            ]);
        }
    }

    private function seedChemicalStocks($tenantId, $facilities): void
    {
        $this->command->info('Creating chemical stocks...');

        $wtpFacilities = $facilities->where('facility_type', 'treatment_plant');
        $chemicals = ['HTH', 'alum', 'sodium_hypochlorite'];

        foreach ($wtpFacilities as $facility) {
            foreach ($chemicals as $chemical) {
                ChemicalStock::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'tenant_id' => $tenantId,
                    'scheme_id' => $facility->scheme_id,
                    'facility_id' => $facility->id,
                    'chemical' => $chemical,
                    'qty_on_hand_kg' => rand(100, 500),
                    'reorder_level_kg' => rand(50, 100),
                    'unit_cost_kes' => match ($chemical) {
                        'HTH' => rand(200, 300),
                        'alum' => rand(50, 100),
                        'sodium_hypochlorite' => rand(80, 150),
                    },
                    'as_of' => Carbon::now(),
                ]);
            }
        }
    }

    private function seedPumpSchedules($tenantId, $facilities, $assets): void
    {
        $this->command->info('Creating pump schedules...');

        $pumpStations = $facilities->where('facility_type', 'pumping_station');

        foreach ($pumpStations as $facility) {
            $pumpAssets = $assets->where('facility_id', $facility->id)->where('asset_class', 'pump');
            
            foreach ($pumpAssets->take(2) as $pump) {
                PumpSchedule::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'tenant_id' => $tenantId,
                    'asset_id' => $pump->id,
                    'schedule_type' => 'time_based',
                    'schedule_data' => [
                        ['day' => 'monday', 'start' => '06:00', 'end' => '10:00'],
                        ['day' => 'monday', 'start' => '18:00', 'end' => '22:00'],
                        ['day' => 'tuesday', 'start' => '06:00', 'end' => '10:00'],
                        ['day' => 'tuesday', 'start' => '18:00', 'end' => '22:00'],
                    ],
                    'active' => true,
                ]);
            }
        }
    }
}
