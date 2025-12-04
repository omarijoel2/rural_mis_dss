<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Organization;
use App\Models\Scheme;
use App\Models\Dma;
use App\Models\Facility;
use App\Models\Zone;
use App\Models\Pipeline;
use App\Models\Address;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Objects\LineString;

class ASALCountySeeders extends Seeder
{
    /**
     * Run the database seeds for all 5 ASAL counties.
     */
    public function run(): void
    {
        $this->seedTurkana();
        $this->seedWajir();
        $this->seedMarsabit();
        $this->seedMandera();
        $this->seedGarissa();
        
        $this->command->info('All 5 ASAL counties seeded successfully!');
    }

    private function seedTurkana(): void
    {
        $tenant = Tenant::where('short_code', 'TWC')->first();
        if (!$tenant) {
            $this->command->warn('Turkana tenant not found. Skipping.');
            return;
        }

        $org = Organization::updateOrCreate(
            ['tenant_id' => $tenant->id, 'org_code' => 'TWC'],
            [
                'name' => 'Turkana Water & Sanitation Company',
                'type' => 'utility',
            ]
        );

        // Turkana schemes - centered around Lodwar (3.1167° N, 35.5833° E)
        $schemes = [
            [
                'code' => 'TLWS-001',
                'name' => 'Lodwar Town Water Supply',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 82970,
                'centroid' => new Point(35.5833, 3.1167, 4326),
            ],
            [
                'code' => 'TKRW-002',
                'name' => 'Kakuma Refugee Settlement Water',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 196666,
                'centroid' => new Point(34.8500, 3.7167, 4326),
            ],
            [
                'code' => 'TLKW-003',
                'name' => 'Lokichogio Water Project',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 15000,
                'centroid' => new Point(34.3500, 4.2000, 4326),
            ],
        ];

        foreach ($schemes as $data) {
            Scheme::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'org_id' => $org->id])
            );
        }

        // Turkana facilities
        $facilities = [
            [
                'code' => 'TRK-BH-001',
                'name' => 'Lodwar Borehole 1',
                'category' => 'source',
                'status' => 'active',
                'address' => 'Lodwar Town',
                'location' => new Point(35.5800, 3.1200, 4326),
                'meta' => ['capacity_m3d' => 500, 'depth_m' => 120],
            ],
            [
                'code' => 'TRK-RES-001',
                'name' => 'Lodwar Elevated Tank',
                'category' => 'reservoir',
                'status' => 'active',
                'address' => 'Lodwar Town Center',
                'location' => new Point(35.5850, 3.1150, 4326),
                'meta' => ['capacity_m3' => 250],
            ],
            [
                'code' => 'TRK-PS-001',
                'name' => 'Kakuma Solar Pumping Station',
                'category' => 'pumpstation',
                'status' => 'active',
                'address' => 'Kakuma Camp',
                'location' => new Point(34.8520, 3.7180, 4326),
                'meta' => ['power_source' => 'solar', 'capacity_m3d' => 800],
            ],
        ];

        $mainScheme = Scheme::where('tenant_id', $tenant->id)->where('code', 'TLWS-001')->first();
        foreach ($facilities as $data) {
            Facility::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'scheme_id' => $mainScheme?->id])
            );
        }

        $this->command->info('  - Turkana County seeded');
    }

    private function seedWajir(): void
    {
        $tenant = Tenant::where('short_code', 'WWC')->first();
        if (!$tenant) {
            $this->command->warn('Wajir tenant not found. Skipping.');
            return;
        }

        $org = Organization::updateOrCreate(
            ['tenant_id' => $tenant->id, 'org_code' => 'WWC'],
            [
                'name' => 'Wajir Water & Sanitation Company',
                'type' => 'utility',
            ]
        );

        // Wajir schemes - centered around Wajir Town (1.7500° N, 40.0667° E)
        $schemes = [
            [
                'code' => 'WWTS-001',
                'name' => 'Wajir Town Water Supply',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 90116,
                'centroid' => new Point(40.0667, 1.7500, 4326),
            ],
            [
                'code' => 'WHAW-002',
                'name' => 'Habaswein Water Project',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 25000,
                'centroid' => new Point(39.4833, 1.0167, 4326),
            ],
            [
                'code' => 'WBLW-003',
                'name' => 'Bute-Leheley Water Scheme',
                'type' => 'rural',
                'status' => 'planning',
                'population_estimate' => 18000,
                'centroid' => new Point(40.3500, 2.0000, 4326),
            ],
        ];

        foreach ($schemes as $data) {
            Scheme::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'org_id' => $org->id])
            );
        }

        // Wajir facilities
        $facilities = [
            [
                'code' => 'WJR-BH-001',
                'name' => 'Wajir Central Borehole',
                'category' => 'source',
                'status' => 'active',
                'address' => 'Wajir Town',
                'location' => new Point(40.0650, 1.7480, 4326),
                'meta' => ['capacity_m3d' => 600, 'depth_m' => 150],
            ],
            [
                'code' => 'WJR-RES-001',
                'name' => 'Wajir Main Reservoir',
                'category' => 'reservoir',
                'status' => 'active',
                'address' => 'Wajir Town',
                'location' => new Point(40.0680, 1.7520, 4326),
                'meta' => ['capacity_m3' => 400],
            ],
        ];

        $mainScheme = Scheme::where('tenant_id', $tenant->id)->where('code', 'WWTS-001')->first();
        foreach ($facilities as $data) {
            Facility::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'scheme_id' => $mainScheme?->id])
            );
        }

        $this->command->info('  - Wajir County seeded');
    }

    private function seedMarsabit(): void
    {
        $tenant = Tenant::where('short_code', 'MWC')->first();
        if (!$tenant) {
            $this->command->warn('Marsabit tenant not found. Skipping.');
            return;
        }

        $org = Organization::updateOrCreate(
            ['tenant_id' => $tenant->id, 'org_code' => 'MWC'],
            [
                'name' => 'Marsabit Water & Sanitation Company',
                'type' => 'utility',
            ]
        );

        // Marsabit schemes - centered around Marsabit Town (2.3333° N, 37.9833° E)
        $schemes = [
            [
                'code' => 'MMWS-001',
                'name' => 'Marsabit Town Water Supply',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 45892,
                'centroid' => new Point(37.9833, 2.3333, 4326),
            ],
            [
                'code' => 'MMOY-002',
                'name' => 'Moyale Water Project',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 35000,
                'centroid' => new Point(39.0500, 3.5167, 4326),
            ],
            [
                'code' => 'MLLW-003',
                'name' => 'Laisamis Rural Water Scheme',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 22000,
                'centroid' => new Point(37.8000, 1.5833, 4326),
            ],
        ];

        foreach ($schemes as $data) {
            Scheme::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'org_id' => $org->id])
            );
        }

        // Marsabit facilities
        $facilities = [
            [
                'code' => 'MRS-SPR-001',
                'name' => 'Marsabit Mountain Spring',
                'category' => 'source',
                'status' => 'active',
                'address' => 'Marsabit Mountain',
                'location' => new Point(37.9700, 2.3200, 4326),
                'meta' => ['source_type' => 'spring', 'capacity_m3d' => 800],
            ],
            [
                'code' => 'MRS-WTP-001',
                'name' => 'Marsabit Water Treatment',
                'category' => 'treatment',
                'status' => 'active',
                'address' => 'Marsabit Town',
                'location' => new Point(37.9850, 2.3350, 4326),
                'meta' => ['capacity_m3d' => 600],
            ],
            [
                'code' => 'MRS-RES-001',
                'name' => 'Marsabit Hill Reservoir',
                'category' => 'reservoir',
                'status' => 'active',
                'address' => 'Marsabit Hill',
                'location' => new Point(37.9880, 2.3400, 4326),
                'meta' => ['capacity_m3' => 500],
            ],
        ];

        $mainScheme = Scheme::where('tenant_id', $tenant->id)->where('code', 'MMWS-001')->first();
        foreach ($facilities as $data) {
            Facility::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'scheme_id' => $mainScheme?->id])
            );
        }

        $this->command->info('  - Marsabit County seeded');
    }

    private function seedMandera(): void
    {
        $tenant = Tenant::where('short_code', 'MDC')->first();
        if (!$tenant) {
            $this->command->warn('Mandera tenant not found. Skipping.');
            return;
        }

        $org = Organization::updateOrCreate(
            ['tenant_id' => $tenant->id, 'org_code' => 'MDC'],
            [
                'name' => 'Mandera Water & Sanitation Company',
                'type' => 'utility',
            ]
        );

        // Mandera schemes - centered around Mandera Town (3.9333° N, 41.8500° E)
        $schemes = [
            [
                'code' => 'MDTW-001',
                'name' => 'Mandera Town Water Supply',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 67382,
                'centroid' => new Point(41.8500, 3.9333, 4326),
            ],
            [
                'code' => 'MDRH-002',
                'name' => 'Rhamu Water Project',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 18000,
                'centroid' => new Point(41.2167, 3.9333, 4326),
            ],
            [
                'code' => 'MDEL-003',
                'name' => 'Elwak Water Scheme',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 25000,
                'centroid' => new Point(40.9167, 2.7833, 4326),
            ],
        ];

        foreach ($schemes as $data) {
            Scheme::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'org_id' => $org->id])
            );
        }

        // Mandera facilities
        $facilities = [
            [
                'code' => 'MDR-RIV-001',
                'name' => 'Daua River Intake',
                'category' => 'source',
                'status' => 'active',
                'address' => 'Daua River, Mandera',
                'location' => new Point(41.8400, 3.9400, 4326),
                'meta' => ['source_type' => 'river', 'capacity_m3d' => 1200],
            ],
            [
                'code' => 'MDR-WTP-001',
                'name' => 'Mandera Water Treatment Plant',
                'category' => 'treatment',
                'status' => 'active',
                'address' => 'Mandera Town',
                'location' => new Point(41.8520, 3.9350, 4326),
                'meta' => ['capacity_m3d' => 1000],
            ],
            [
                'code' => 'MDR-RES-001',
                'name' => 'Mandera Elevated Tank',
                'category' => 'reservoir',
                'status' => 'active',
                'address' => 'Mandera Town Center',
                'location' => new Point(41.8550, 3.9320, 4326),
                'meta' => ['capacity_m3' => 350],
            ],
        ];

        $mainScheme = Scheme::where('tenant_id', $tenant->id)->where('code', 'MDTW-001')->first();
        foreach ($facilities as $data) {
            Facility::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'scheme_id' => $mainScheme?->id])
            );
        }

        $this->command->info('  - Mandera County seeded');
    }

    private function seedGarissa(): void
    {
        $tenant = Tenant::where('short_code', 'GWC')->first();
        if (!$tenant) {
            $this->command->warn('Garissa tenant not found. Skipping.');
            return;
        }

        $org = Organization::updateOrCreate(
            ['tenant_id' => $tenant->id, 'org_code' => 'GWC'],
            [
                'name' => 'Garissa Water & Sanitation Company',
                'type' => 'utility',
            ]
        );

        // Garissa schemes - centered around Garissa Town (0.4536° S, 39.6401° E)
        $schemes = [
            [
                'code' => 'GCWSS-001',
                'name' => 'Garissa Central Water Supply Scheme',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 120000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.63, -0.43),
                        new Point(39.68, -0.43),
                        new Point(39.68, -0.48),
                        new Point(39.63, -0.48),
                        new Point(39.63, -0.43),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(39.655, -0.455, 4326),
            ],
            [
                'code' => 'GRWP-002',
                'name' => 'Garissa Rural Water Project',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 45000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.50, -0.50),
                        new Point(39.80, -0.50),
                        new Point(39.80, -0.20),
                        new Point(39.50, -0.20),
                        new Point(39.50, -0.50),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(39.65, -0.35, 4326),
            ],
            [
                'code' => 'IJWSP-003',
                'name' => 'Ijara Water Supply Project',
                'type' => 'rural',
                'status' => 'planning',
                'population_estimate' => 32000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.80, -0.60),
                        new Point(39.95, -0.60),
                        new Point(39.95, -0.75),
                        new Point(39.80, -0.75),
                        new Point(39.80, -0.60),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(39.875, -0.675, 4326),
            ],
            [
                'code' => 'FWSS-004',
                'name' => 'Fafi Water Supply Scheme',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 28000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.40, -0.30),
                        new Point(39.60, -0.30),
                        new Point(39.60, -0.50),
                        new Point(39.40, -0.50),
                        new Point(39.40, -0.30),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(39.50, -0.40, 4326),
            ],
        ];

        foreach ($schemes as $data) {
            Scheme::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'org_id' => $org->id])
            );
        }

        $mainScheme = Scheme::where('tenant_id', $tenant->id)->where('code', 'GCWSS-001')->first();

        // Garissa DMAs
        $dmas = [
            [
                'code' => 'DMA-G1-TOWN',
                'name' => 'DMA Zone 1 - Garissa Town',
                'scheme_id' => $mainScheme?->id,
                'status' => 'active',
                'nightline_threshold_m3h' => 8.5,
                'pressure_target_bar' => 3.0,
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.64, -0.44),
                        new Point(39.66, -0.44),
                        new Point(39.66, -0.46),
                        new Point(39.64, -0.46),
                        new Point(39.64, -0.44),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'DMA-G2-WEST',
                'name' => 'DMA Zone 2 - West Garissa',
                'scheme_id' => $mainScheme?->id,
                'status' => 'active',
                'nightline_threshold_m3h' => 5.2,
                'pressure_target_bar' => 2.8,
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.63, -0.43),
                        new Point(39.645, -0.43),
                        new Point(39.645, -0.48),
                        new Point(39.63, -0.48),
                        new Point(39.63, -0.43),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'DMA-G3-EAST',
                'name' => 'DMA Zone 3 - East Garissa',
                'scheme_id' => $mainScheme?->id,
                'status' => 'active',
                'nightline_threshold_m3h' => 6.8,
                'pressure_target_bar' => 3.2,
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.655, -0.43),
                        new Point(39.68, -0.43),
                        new Point(39.68, -0.48),
                        new Point(39.655, -0.48),
                        new Point(39.655, -0.43),
                    ], 4326)
                ], 4326),
            ],
        ];

        foreach ($dmas as $data) {
            Dma::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }

        // Garissa facilities
        $facilities = [
            [
                'code' => 'GAR-SRC-001',
                'name' => 'Tana River Water Source',
                'category' => 'source',
                'status' => 'active',
                'address' => 'Garissa-Lamu Road',
                'location' => new Point(39.55, -0.50, 4326),
                'meta' => ['capacity_m3d' => 2400],
            ],
            [
                'code' => 'GAR-WTP-001',
                'name' => 'Garissa Water Treatment Plant',
                'category' => 'treatment',
                'status' => 'active',
                'address' => 'Tana River Road',
                'location' => new Point(39.64, -0.45, 4326),
                'meta' => ['capacity_m3d' => 2000],
            ],
            [
                'code' => 'GAR-RES-001',
                'name' => 'Garissa Main Reservoir',
                'category' => 'reservoir',
                'status' => 'active',
                'address' => 'Garissa Town',
                'location' => new Point(39.655, -0.455, 4326),
                'meta' => ['capacity_m3d' => 1200],
            ],
            [
                'code' => 'GAR-PS-001',
                'name' => 'Garissa Pumping Station 1',
                'category' => 'pumpstation',
                'status' => 'active',
                'address' => 'East Garissa',
                'location' => new Point(39.66, -0.46, 4326),
                'meta' => ['capacity_m3d' => 800],
            ],
            [
                'code' => 'GAR-PS-002',
                'name' => 'Garissa Pumping Station 2',
                'category' => 'pumpstation',
                'status' => 'active',
                'address' => 'West Garissa',
                'location' => new Point(39.63, -0.44, 4326),
                'meta' => ['capacity_m3d' => 600],
            ],
        ];

        foreach ($facilities as $data) {
            Facility::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'scheme_id' => $mainScheme?->id])
            );
        }

        // Garissa zones
        $zones = [
            [
                'code' => 'ZONE-G-TOWN',
                'name' => 'Garissa Town Zone',
                'type' => 'urban',
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.64, -0.44),
                        new Point(39.67, -0.44),
                        new Point(39.67, -0.47),
                        new Point(39.64, -0.47),
                        new Point(39.64, -0.44),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'ZONE-G-RURAL',
                'name' => 'Garissa Rural Zone',
                'type' => 'rural',
                'geom' => new Polygon([
                    new LineString([
                        new Point(39.50, -0.50),
                        new Point(39.80, -0.50),
                        new Point(39.80, -0.20),
                        new Point(39.50, -0.20),
                        new Point(39.50, -0.50),
                    ], 4326)
                ], 4326),
            ],
        ];

        foreach ($zones as $data) {
            Zone::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }

        // Garissa pipelines
        $pipelines = [
            [
                'code' => 'PIPE-G-001',
                'material' => 'DI',
                'diameter_mm' => 400,
                'install_year' => 2015,
                'status' => 'active',
                'meta' => ['type' => 'primary_main', 'length_km' => 15.5, 'description' => 'Tana River to WTP Primary Main'],
                'geom' => new LineString([
                    new Point(39.55, -0.50),
                    new Point(39.60, -0.48),
                    new Point(39.64, -0.45),
                ], 4326),
            ],
            [
                'code' => 'PIPE-G-002',
                'material' => 'AC',
                'diameter_mm' => 300,
                'install_year' => 2016,
                'status' => 'active',
                'meta' => ['type' => 'secondary_main', 'length_km' => 2.0, 'description' => 'WTP to Main Reservoir Pipeline'],
                'geom' => new LineString([
                    new Point(39.64, -0.45),
                    new Point(39.655, -0.455),
                ], 4326),
            ],
            [
                'code' => 'PIPE-G-003',
                'material' => 'uPVC',
                'diameter_mm' => 200,
                'install_year' => 2017,
                'status' => 'active',
                'meta' => ['type' => 'distribution_main', 'length_km' => 45.8, 'description' => 'Distribution Main - Town Network'],
                'geom' => new LineString([
                    new Point(39.655, -0.455),
                    new Point(39.66, -0.46),
                    new Point(39.65, -0.44),
                ], 4326),
            ],
        ];

        foreach ($pipelines as $data) {
            Pipeline::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['tenant_id' => $tenant->id, 'scheme_id' => $mainScheme?->id])
            );
        }

        // Garissa addresses
        $addresses = [
            ['premise_code' => 'HQ-001', 'street' => 'Kenyatta Avenue', 'city' => 'Garissa', 'postcode' => '70100', 'country' => 'KE', 'location' => new Point(39.655, -0.455, 4326)],
            ['premise_code' => 'WTP-001', 'street' => 'Tana River Road', 'city' => 'Garissa', 'postcode' => '70100', 'country' => 'KE', 'location' => new Point(39.64, -0.45, 4326)],
            ['premise_code' => 'SRC-001', 'street' => 'Garissa-Lamu Road', 'city' => 'Garissa', 'postcode' => '70100', 'country' => 'KE', 'location' => new Point(39.55, -0.50, 4326)],
        ];

        foreach ($addresses as $data) {
            Address::firstOrCreate(
                ['tenant_id' => $tenant->id, 'premise_code' => $data['premise_code']],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }

        $this->command->info('  - Garissa County seeded');
    }
}
