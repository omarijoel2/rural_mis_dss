<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetClass;
use App\Models\Part;
use App\Models\Supplier;
use App\Models\WorkOrder;
use App\Models\PmPolicy;
use App\Models\PmSchedule;
use App\Models\StockTxn;
use App\Models\WoPart;
use App\Models\WoLabor;
use App\Models\Organization;
use App\Models\Scheme;
use App\Models\Dma;
use App\Models\User;
use Illuminate\Database\Seeder;
use MatanYadaev\EloquentSpatial\Objects\Point;

class CmmsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting CMMS seeder...');

        $tenant = Organization::first();
        if (!$tenant) {
            $this->command->error('No organization found. Please run organization seeder first.');
            return;
        }

        $user = User::where('email', 'admin@kwu.test')->first();
        if (!$user) {
            $user = User::first();
        }

        $scheme = Scheme::first();
        $dma = Dma::first();

        $this->seedAssetClasses();
        $this->seedParts($tenant);
        $this->seedSuppliers($tenant);
        $this->seedAssets($tenant, $scheme, $dma, $user);
        $this->seedStockTransactions();
        $this->seedPmPolicies();
        
        if ($user) {
            $this->seedWorkOrders($tenant, $user);
        } else {
            $this->command->warn('No users found. Skipping work order seeding.');
        }

        $this->command->info('CMMS seeder completed successfully!');
    }

    protected function seedAssetClasses(): void
    {
        $classes = [
            ['code' => 'INFRA', 'name' => 'Infrastructure', 'parent_id' => null],
            ['code' => 'EQUIP', 'name' => 'Equipment', 'parent_id' => null],
            ['code' => 'VEH', 'name' => 'Vehicles', 'parent_id' => null],
        ];

        $classIds = [];
        foreach ($classes as $class) {
            $classIds[$class['name']] = AssetClass::firstOrCreate(
                ['code' => $class['code']],
                $class
            )->id;
        }

        $subclasses = [
            ['code' => 'PIPE', 'name' => 'Pipelines', 'parent' => 'Infrastructure'],
            ['code' => 'RSV', 'name' => 'Reservoirs', 'parent' => 'Infrastructure'],
            ['code' => 'PUMP', 'name' => 'Pumps', 'parent' => 'Equipment'],
            ['code' => 'VALVE', 'name' => 'Valves', 'parent' => 'Equipment'],
            ['code' => 'MTR', 'name' => 'Meters', 'parent' => 'Equipment'],
            ['code' => 'TREAT', 'name' => 'Treatment Units', 'parent' => 'Equipment'],
            ['code' => 'SVC', 'name' => 'Service Vehicles', 'parent' => 'Vehicles'],
        ];

        foreach ($subclasses as $subclass) {
            AssetClass::firstOrCreate(
                ['code' => $subclass['code']],
                ['code' => $subclass['code'], 'name' => $subclass['name'], 'parent_id' => $classIds[$subclass['parent']]]
            );
        }

        $this->command->info('Asset classes created.');
    }

    protected function seedParts($tenant): void
    {
        $parts = [
            ['code' => 'PMP-001', 'name' => 'Centrifugal Pump Impeller', 'category' => 'pumps', 'unit' => 'EA', 'min_qty' => 2, 'reorder_qty' => 5],
            ['code' => 'VLV-001', 'name' => 'Gate Valve 100mm', 'category' => 'valves', 'unit' => 'EA', 'min_qty' => 5, 'reorder_qty' => 10],
            ['code' => 'VLV-002', 'name' => 'Ball Valve 50mm', 'category' => 'valves', 'unit' => 'EA', 'min_qty' => 10, 'reorder_qty' => 20],
            ['code' => 'PIP-001', 'name' => 'PVC Pipe 110mm', 'category' => 'pipes', 'unit' => 'M', 'min_qty' => 50, 'reorder_qty' => 100],
            ['code' => 'FTG-001', 'name' => 'Elbow 90deg 110mm', 'category' => 'fittings', 'unit' => 'EA', 'min_qty' => 20, 'reorder_qty' => 50],
            ['code' => 'FTG-002', 'name' => 'T-Joint 110mm', 'category' => 'fittings', 'unit' => 'EA', 'min_qty' => 15, 'reorder_qty' => 30],
            ['code' => 'CHM-001', 'name' => 'Chlorine Tablets', 'category' => 'chemicals', 'unit' => 'KG', 'min_qty' => 100, 'reorder_qty' => 200],
            ['code' => 'MTR-001', 'name' => 'Water Meter 20mm', 'category' => 'meters', 'unit' => 'EA', 'min_qty' => 10, 'reorder_qty' => 25],
            ['code' => 'ELC-001', 'name' => 'Motor Bearing', 'category' => 'electrical', 'unit' => 'EA', 'min_qty' => 5, 'reorder_qty' => 15],
            ['code' => 'ELC-002', 'name' => 'Control Panel Relay', 'category' => 'electrical', 'unit' => 'EA', 'min_qty' => 8, 'reorder_qty' => 20],
        ];

        foreach ($parts as $part) {
            Part::firstOrCreate(
                ['code' => $part['code']],
                array_merge($part, ['tenant_id' => $tenant->id])
            );
        }

        $this->command->info('Parts created.');
    }

    protected function seedSuppliers($tenant): void
    {
        $suppliers = [
            ['name' => 'Aqua Systems Ltd', 'email' => 'sales@aquasystems.example', 'phone' => '+254700123456'],
            ['name' => 'Pipeline Distributors', 'email' => 'info@pipelinedist.example', 'phone' => '+254700234567'],
            ['name' => 'Electro-Mech Suppliers', 'email' => 'orders@electromech.example', 'phone' => '+254700345678'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(
                ['email' => $supplier['email']],
                array_merge($supplier, ['tenant_id' => $tenant->id])
            );
        }

        $this->command->info('Suppliers created.');
    }

    protected function seedAssets($tenant, $scheme, $dma, $user): void
    {
        $pipelineClass = AssetClass::where('name', 'Pipelines')->first();
        $pumpClass = AssetClass::where('name', 'Pumps')->first();
        $valveClass = AssetClass::where('name', 'Valves')->first();
        $reservoirClass = AssetClass::where('name', 'Reservoirs')->first();
        $meterClass = AssetClass::where('name', 'Meters')->first();

        $assetCount = 0;

        for ($i = 1; $i <= 20; $i++) {
            $lat = -1.286389 + (rand(-1000, 1000) / 10000);
            $lng = 36.817223 + (rand(-1000, 1000) / 10000);

            Asset::create([
                'tenant_id' => $tenant->id,
                'code' => "PIP-{$i}",
                'name' => "Main Pipeline Section {$i}",
                'class_id' => $pipelineClass->id,
                'scheme_id' => $scheme?->id,
                'dma_id' => $dma?->id,
                'status' => ['active', 'active', 'active', 'under_maintenance'][rand(0, 3)],
                'install_date' => now()->subYears(rand(1, 20)),
                'manufacturer' => 'PVC Industries',
                'model' => '110mm-SDR11',
                'geom' => new Point($lat, $lng)
            ]);
            $assetCount++;
        }

        for ($i = 1; $i <= 15; $i++) {
            $lat = -1.286389 + (rand(-1000, 1000) / 10000);
            $lng = 36.817223 + (rand(-1000, 1000) / 10000);

            Asset::create([
                'tenant_id' => $tenant->id,
                'code' => "PMP-{$i}",
                'name' => "Pump Station {$i}",
                'class_id' => $pumpClass->id,
                'scheme_id' => $scheme?->id,
                'status' => ['active', 'active', 'inactive'][rand(0, 2)],
                'install_date' => now()->subYears(rand(1, 15)),
                'manufacturer' => ['Grundfos', 'Ebara', 'KSB'][rand(0, 2)],
                'model' => 'CR-' . rand(10, 50),
                'geom' => new Point($lat, $lng)
            ]);
            $assetCount++;
        }

        for ($i = 1; $i <= 30; $i++) {
            $lat = -1.286389 + (rand(-1000, 1000) / 10000);
            $lng = 36.817223 + (rand(-1000, 1000) / 10000);

            Asset::create([
                'tenant_id' => $tenant->id,
                'code' => "VLV-{$i}",
                'name' => "Control Valve {$i}",
                'class_id' => $valveClass->id,
                'scheme_id' => $scheme?->id,
                'dma_id' => $dma?->id,
                'status' => 'active',
                'install_date' => now()->subYears(rand(1, 10)),
                'manufacturer' => 'Valvetek',
                'geom' => new Point($lat, $lng)
            ]);
            $assetCount++;
        }

        for ($i = 1; $i <= 5; $i++) {
            $lat = -1.286389 + (rand(-1000, 1000) / 10000);
            $lng = 36.817223 + (rand(-1000, 1000) / 10000);

            Asset::create([
                'tenant_id' => $tenant->id,
                'code' => "RSV-{$i}",
                'name' => "Reservoir {$i}",
                'class_id' => $reservoirClass->id,
                'scheme_id' => $scheme?->id,
                'status' => 'active',
                'install_date' => now()->subYears(rand(5, 30)),
                'specs' => json_encode(['capacity_m3' => rand(50, 500)]),
                'geom' => new Point($lat, $lng)
            ]);
            $assetCount++;
        }

        for ($i = 1; $i <= 30; $i++) {
            $lat = -1.286389 + (rand(-1000, 1000) / 10000);
            $lng = 36.817223 + (rand(-1000, 1000) / 10000);

            Asset::create([
                'tenant_id' => $tenant->id,
                'code' => "MTR-{$i}",
                'name' => "Customer Meter {$i}",
                'class_id' => $meterClass->id,
                'dma_id' => $dma?->id,
                'status' => 'active',
                'install_date' => now()->subYears(rand(1, 8)),
                'serial' => 'SN' . str_pad($i, 8, '0', STR_PAD_LEFT),
                'geom' => new Point($lat, $lng)
            ]);
            $assetCount++;
        }

        $this->command->info("{$assetCount} assets created.");
    }

    protected function seedStockTransactions(): void
    {
        $parts = Part::all();
        
        foreach ($parts as $part) {
            for ($i = 0; $i < rand(3, 8); $i++) {
                StockTxn::create([
                    'part_id' => $part->id,
                    'kind' => 'receipt',
                    'qty' => rand(10, 100),
                    'unit_cost' => rand(100, 5000),
                    'ref' => 'PO-' . rand(1000, 9999),
                    'occurred_at' => now()->subDays(rand(1, 180))
                ]);
            }
        }

        $this->command->info('Stock transactions created.');
    }

    protected function seedPmPolicies(): void
    {
        $pumps = Asset::whereHas('assetClass', function ($q) {
            $q->where('name', 'Pumps');
        })->take(20)->get();

        foreach ($pumps as $pump) {
            $policy = PmPolicy::create([
                'asset_id' => $pump->id,
                'strategy' => 'time',
                'interval_value' => 3,
                'interval_unit' => 'months',
                'task' => 'Quarterly pump maintenance',
                'instructions' => 'Check bearings, lubrication, electrical connections, and test operation',
                'is_active' => true
            ]);

            PmSchedule::create([
                'pm_policy_id' => $policy->id,
                'next_due' => now()->addMonths(rand(1, 3)),
                'status' => 'scheduled'
            ]);
        }

        $this->command->info('PM policies created.');
    }

    protected function seedWorkOrders($tenant, $user): void
    {
        $assets = Asset::inRandomOrder()->take(80)->get();
        $statuses = ['draft', 'approved', 'assigned', 'in_progress', 'completed', 'completed'];
        $kinds = ['pm', 'cm', 'emergency', 'project'];
        $priorities = ['low', 'medium', 'medium', 'high', 'critical'];

        foreach ($assets as $asset) {
            $status = $statuses[array_rand($statuses)];
            $kind = $kinds[array_rand($kinds)];

            $wo = WorkOrder::create([
                'tenant_id' => $tenant->id,
                'wo_num' => 'WO' . now()->format('y') . str_pad(rand(1, 999), 5, '0', STR_PAD_LEFT),
                'kind' => $kind,
                'asset_id' => $asset->id,
                'title' => ucfirst($kind) . ' work on ' . $asset->name,
                'description' => 'Scheduled maintenance and inspection',
                'priority' => $priorities[array_rand($priorities)],
                'status' => $status,
                'created_by' => $user->id,
                'assigned_to' => rand(0, 1) ? $user->id : null,
                'scheduled_for' => now()->addDays(rand(-30, 30)),
                'geom' => $asset->geom
            ]);

            if (in_array($status, ['in_progress', 'completed'])) {
                $wo->update(['started_at' => now()->subDays(rand(1, 10))]);
            }

            if ($status === 'completed') {
                $wo->update([
                    'completed_at' => now()->subDays(rand(0, 5)),
                    'completion_notes' => 'Work completed successfully. All systems operational.'
                ]);

                $parts = Part::inRandomOrder()->take(rand(1, 3))->get();
                foreach ($parts as $part) {
                    WoPart::create([
                        'work_order_id' => $wo->id,
                        'part_id' => $part->id,
                        'qty' => rand(1, 5),
                        'unit_cost' => rand(100, 2000)
                    ]);
                }

                WoLabor::create([
                    'work_order_id' => $wo->id,
                    'user_id' => $user->id,
                    'hours' => rand(2, 16),
                    'rate' => rand(500, 1500)
                ]);
            }
        }

        $this->command->info('Work orders created.');
    }
}
