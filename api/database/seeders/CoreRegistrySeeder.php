<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Organization;
use App\Models\Scheme;
use App\Models\Dma;
use App\Models\Facility;
use App\Models\Zone;
use App\Models\Pipeline;
use App\Models\Address;
use App\Models\Meter;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Objects\LineString;

class CoreRegistrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Auto-create tenant if none exists
        $tenant = Tenant::first();
        if (!$tenant) {
            $tenant = Tenant::create([
                'name' => 'Nairobi Water & Sewerage Company',
                'short_code' => 'NWSC',
                'county' => 'Nairobi',
                'country' => 'KE',
                'timezone' => 'Africa/Nairobi',
                'currency' => 'KES',
                'status' => 'active',
            ]);
            $this->command->info('Created default tenant: ' . $tenant->name);
        }

        $org = Organization::where('tenant_id', $tenant->id)->first();
        if (!$org) {
            $org = Organization::create([
                'tenant_id' => $tenant->id,
                'name' => 'Nairobi Water & Sewerage Company',
                'org_code' => 'NWSC',
                'type' => 'utility',
            ]);
        }

        $this->seedSchemes($tenant, $org);
        $this->seedDmas($tenant);
        $this->seedFacilities($tenant);
        $this->seedZones($tenant);
        $this->seedPipelines($tenant);
        $this->seedAddresses($tenant);
        // $this->seedMeters($tenant); // Meters table not created yet

        $this->command->info('Core registry seeded with realistic Kenya spatial data');
    }

    private function seedSchemes(Tenant $tenant, Organization $org): void
    {
        $schemes = [
            [
                'code' => 'NCWSS-001',
                'name' => 'Nairobi Central Water Supply Scheme',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 1500000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.75, -1.25),
                        new Point(36.85, -1.25),
                        new Point(36.85, -1.35),
                        new Point(36.75, -1.35),
                        new Point(36.75, -1.25),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(36.80, -1.30, 4326),
            ],
            [
                'code' => 'WWSS-002',
                'name' => 'Westlands Water Supply Scheme',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 450000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.78, -1.24),
                        new Point(36.83, -1.24),
                        new Point(36.83, -1.28),
                        new Point(36.78, -1.28),
                        new Point(36.78, -1.24),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(36.805, -1.26, 4326),
            ],
            [
                'code' => 'KRWP-003',
                'name' => 'Kikuyu Rural Water Project',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 85000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.62, -1.20),
                        new Point(36.72, -1.20),
                        new Point(36.72, -1.28),
                        new Point(36.62, -1.28),
                        new Point(36.62, -1.20),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(36.67, -1.24, 4326),
            ],
            [
                'code' => 'TWSS-004',
                'name' => 'Thika Water & Sanitation Scheme',
                'type' => 'urban',
                'status' => 'planning',
                'population_estimate' => 250000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(37.05, -1.00),
                        new Point(37.15, -1.00),
                        new Point(37.15, -1.08),
                        new Point(37.05, -1.08),
                        new Point(37.05, -1.00),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(37.10, -1.04, 4326),
            ],
        ];

        foreach ($schemes as $data) {
            Scheme::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, [
                    'tenant_id' => $tenant->id,
                    'org_id' => $org->id,
                ])
            );
        }
    }

    private function seedDmas(Tenant $tenant): void
    {
        // Use deterministic lookup for base scheme
        $nairobi = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'NCWSS-001')
            ->first();
        
        if (!$nairobi) {
            $this->command->warn('Base scheme NCWSS-001 not found. Skipping DMAs.');
            return;
        }
        
        $dmas = [
            [
                'code' => 'DMA-Z1-CBD',
                'name' => 'DMA Zone 1 - CBD',
                'scheme_id' => $nairobi->id,
                'status' => 'active',
                'nightline_threshold_m3h' => 12.5,
                'pressure_target_bar' => 3.5,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.80, -1.28),
                        new Point(36.83, -1.28),
                        new Point(36.83, -1.30),
                        new Point(36.80, -1.30),
                        new Point(36.80, -1.28),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'DMA-Z2-KLM',
                'name' => 'DMA Zone 2 - Kilimani',
                'scheme_id' => $nairobi->id,
                'status' => 'active',
                'nightline_threshold_m3h' => 15.0,
                'pressure_target_bar' => 4.0,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.76, -1.29),
                        new Point(36.80, -1.29),
                        new Point(36.80, -1.32),
                        new Point(36.76, -1.32),
                        new Point(36.76, -1.29),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'DMA-Z3-EST',
                'name' => 'DMA Zone 3 - Eastleigh',
                'scheme_id' => $nairobi->id,
                'status' => 'planned',
                'nightline_threshold_m3h' => 18.0,
                'pressure_target_bar' => 3.0,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.85, -1.26),
                        new Point(36.90, -1.26),
                        new Point(36.90, -1.30),
                        new Point(36.85, -1.30),
                        new Point(36.85, -1.26),
                    ], 4326)
                ], 4326),
            ],
        ];

        foreach ($dmas as $data) {
            Dma::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }
    }

    private function seedFacilities(Tenant $tenant): void
    {
        // Use deterministic lookup for base scheme
        $nairobi = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'NCWSS-001')
            ->first();
        
        if (!$nairobi) {
            $this->command->warn('Base scheme NCWSS-001 not found. Skipping facilities.');
            return;
        }

        $facilities = [
            [
                'code' => 'FAC-SWTP-001',
                'name' => 'Sasumua Water Treatment Plant',
                'category' => 'treatment',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.65, -1.10, 4326),
            ],
            [
                'code' => 'FAC-NSS-002',
                'name' => 'Ngethu Spring Source',
                'category' => 'source',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.68, -1.08, 4326),
            ],
            [
                'code' => 'FAC-GPS-003',
                'name' => 'Gigiri Pumping Station',
                'category' => 'pumpstation',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.78, -1.24, 4326),
            ],
            [
                'code' => 'FAC-RSR-004',
                'name' => 'Ruaraka Service Reservoir',
                'category' => 'reservoir',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.88, -1.25, 4326),
            ],
            [
                'code' => 'FAC-KBS-005',
                'name' => 'Kabete Booster Station',
                'category' => 'pumpstation',
                'status' => 'standby',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.73, -1.26, 4326),
            ],
            [
                'code' => 'FAC-KWQL-006',
                'name' => 'Karura Water Quality Lab',
                'category' => 'lab',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.82, -1.25, 4326),
            ],
            [
                'code' => 'FAC-NDS-007',
                'name' => 'Ndakaini Dam Source',
                'category' => 'source',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(37.05, -0.75, 4326),
            ],
            [
                'code' => 'FAC-CPR-008',
                'name' => 'City Park Reservoir',
                'category' => 'reservoir',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.83, -1.27, 4326),
            ],
        ];

        foreach ($facilities as $data) {
            Facility::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }
    }

    private function seedZones(Tenant $tenant): void
    {
        // Use deterministic lookup for base scheme
        $nairobi = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'NCWSS-001')
            ->first();
        
        if (!$nairobi) {
            $this->command->warn('Base scheme NCWSS-001 not found. Skipping zones.');
            return;
        }

        $zones = [
            [
                'code' => 'ZONE-WEST-01',
                'name' => 'Westlands Commercial Zone',
                'type' => 'commercial',
                'scheme_id' => $nairobi->id,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.80, -1.26),
                        new Point(36.82, -1.26),
                        new Point(36.82, -1.28),
                        new Point(36.80, -1.28),
                        new Point(36.80, -1.26),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'ZONE-RES-02',
                'name' => 'Kilimani Residential Zone',
                'type' => 'residential',
                'scheme_id' => $nairobi->id,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.77, -1.29),
                        new Point(36.79, -1.29),
                        new Point(36.79, -1.31),
                        new Point(36.77, -1.31),
                        new Point(36.77, -1.29),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'ZONE-IND-03',
                'name' => 'Industrial Area Zone',
                'type' => 'industrial',
                'scheme_id' => $nairobi->id,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.84, -1.31),
                        new Point(36.87, -1.31),
                        new Point(36.87, -1.34),
                        new Point(36.84, -1.34),
                        new Point(36.84, -1.31),
                    ], 4326)
                ], 4326),
            ],
            [
                'code' => 'ZONE-MIX-04',
                'name' => 'Upperhill Mixed-Use Zone',
                'type' => 'mixed',
                'scheme_id' => $nairobi->id,
                'geom' => new Polygon([
                    new LineString([
                        new Point(36.81, -1.28),
                        new Point(36.83, -1.28),
                        new Point(36.83, -1.30),
                        new Point(36.81, -1.30),
                        new Point(36.81, -1.28),
                    ], 4326)
                ], 4326),
            ],
        ];

        foreach ($zones as $data) {
            Zone::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }
    }

    private function seedPipelines(Tenant $tenant): void
    {
        // Use deterministic lookup for base scheme
        $nairobi = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'NCWSS-001')
            ->first();
        
        if (!$nairobi) {
            $this->command->warn('Base scheme NCWSS-001 not found. Skipping pipelines.');
            return;
        }

        $pipelines = [
            [
                'code' => 'PIPE-TR-001',
                'material' => 'DI',
                'diameter_mm' => 800,
                'install_year' => 2015,
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'geom' => new LineString([
                    new Point(36.65, -1.10),
                    new Point(36.71, -1.17),
                    new Point(36.78, -1.24),
                ], 4326),
            ],
            [
                'code' => 'PIPE-DS-002',
                'material' => 'uPVC',
                'diameter_mm' => 300,
                'install_year' => 2018,
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'geom' => new LineString([
                    new Point(36.81, -1.28),
                    new Point(36.82, -1.29),
                    new Point(36.82, -1.30),
                ], 4326),
            ],
            [
                'code' => 'PIPE-DS-003',
                'material' => 'HDPE',
                'diameter_mm' => 200,
                'install_year' => 2020,
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'geom' => new LineString([
                    new Point(36.77, -1.29),
                    new Point(36.78, -1.30),
                    new Point(36.79, -1.31),
                ], 4326),
            ],
            [
                'code' => 'PIPE-TR-004',
                'material' => 'Steel',
                'diameter_mm' => 600,
                'install_year' => 2012,
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'geom' => new LineString([
                    new Point(36.78, -1.24),
                    new Point(36.84, -1.25),
                    new Point(36.88, -1.25),
                ], 4326),
            ],
            [
                'code' => 'PIPE-DS-005',
                'material' => 'DI',
                'diameter_mm' => 400,
                'install_year' => 2016,
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'geom' => new LineString([
                    new Point(36.84, -1.31),
                    new Point(36.85, -1.32),
                    new Point(36.86, -1.34),
                ], 4326),
            ],
        ];

        foreach ($pipelines as $data) {
            Pipeline::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }
    }

    private function seedAddresses(Tenant $tenant): void
    {
        // Use deterministic lookup for base scheme
        $nairobi = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'NCWSS-001')
            ->first();
        
        if (!$nairobi) {
            $this->command->warn('Base scheme NCWSS-001 not found. Skipping addresses.');
            return;
        }

        $addresses = [
            [
                'premise_code' => 'ADDR-001',
                'street' => 'Kenyatta Avenue, Plot 45',
                'city' => 'Nairobi',
                'postcode' => '00100',
                'country' => 'KE',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.8219, -1.2850, 4326),
            ],
            [
                'premise_code' => 'ADDR-002',
                'street' => 'Waiyaki Way, Westlands',
                'city' => 'Nairobi',
                'postcode' => '00600',
                'country' => 'KE',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.8064, -1.2695, 4326),
            ],
            [
                'premise_code' => 'ADDR-003',
                'street' => 'Ngong Road, Kilimani Estate',
                'city' => 'Nairobi',
                'postcode' => '00100',
                'country' => 'KE',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.7826, -1.2974, 4326),
            ],
            [
                'premise_code' => 'ADDR-004',
                'street' => 'Industrial Area, Enterprise Road',
                'city' => 'Nairobi',
                'postcode' => '00100',
                'country' => 'KE',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.8537, -1.3230, 4326),
            ],
            [
                'premise_code' => 'ADDR-005',
                'street' => 'Upperhill, Ralph Bunche Road',
                'city' => 'Nairobi',
                'postcode' => '00100',
                'country' => 'KE',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.8156, -1.2895, 4326),
            ],
            [
                'premise_code' => 'ADDR-006',
                'street' => 'Riverside Drive, Westlands',
                'city' => 'Nairobi',
                'postcode' => '00600',
                'country' => 'KE',
                'scheme_id' => $nairobi->id,
                'location' => new Point(36.8091, -1.2643, 4326),
            ],
        ];

        foreach ($addresses as $data) {
            Address::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'premise_code' => $data['premise_code'],
                ],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }
    }

    private function seedMeters(Tenant $tenant): void
    {
        $addresses = Address::where('tenant_id', $tenant->id)->get();
        
        if ($addresses->isEmpty()) {
            return;
        }

        $meters = [
            [
                'meter_number' => 'MTR-2024-001',
                'meter_type' => 'residential',
                'size_mm' => 15,
                'manufacturer' => 'Sensus',
                'model' => 'iPERL',
                'installation_date' => '2023-01-15',
                'status' => 'active',
                'last_reading' => 1245.50,
                'last_reading_date' => '2024-11-20',
                'address_id' => $addresses[0]->id ?? null,
            ],
            [
                'meter_number' => 'MTR-2024-002',
                'meter_type' => 'commercial',
                'size_mm' => 25,
                'manufacturer' => 'Elster',
                'model' => 'Amco C700',
                'installation_date' => '2022-06-10',
                'status' => 'active',
                'last_reading' => 5678.75,
                'last_reading_date' => '2024-11-20',
                'address_id' => $addresses[1]->id ?? null,
            ],
            [
                'meter_number' => 'MTR-2024-003',
                'meter_type' => 'residential',
                'size_mm' => 15,
                'manufacturer' => 'Kamstrup',
                'model' => 'flowIQ 2200',
                'installation_date' => '2023-03-22',
                'status' => 'active',
                'last_reading' => 892.25,
                'last_reading_date' => '2024-11-19',
                'address_id' => $addresses[2]->id ?? null,
            ],
            [
                'meter_number' => 'MTR-2024-004',
                'meter_type' => 'industrial',
                'size_mm' => 50,
                'manufacturer' => 'Elster',
                'model' => 'H4000',
                'installation_date' => '2021-11-05',
                'status' => 'active',
                'last_reading' => 15240.00,
                'last_reading_date' => '2024-11-20',
                'address_id' => $addresses[3]->id ?? null,
            ],
            [
                'meter_number' => 'MTR-2024-005',
                'meter_type' => 'commercial',
                'size_mm' => 20,
                'manufacturer' => 'Sensus',
                'model' => 'iPERL',
                'installation_date' => '2023-07-18',
                'status' => 'faulty',
                'last_reading' => 3456.50,
                'last_reading_date' => '2024-11-10',
                'address_id' => $addresses[4]->id ?? null,
            ],
            [
                'meter_number' => 'MTR-2024-006',
                'meter_type' => 'residential',
                'size_mm' => 15,
                'manufacturer' => 'Kamstrup',
                'model' => 'Multical 21',
                'installation_date' => '2024-02-10',
                'status' => 'active',
                'last_reading' => 245.75,
                'last_reading_date' => '2024-11-20',
                'address_id' => $addresses[5]->id ?? null,
            ],
            [
                'meter_number' => 'MTR-2024-007',
                'meter_type' => 'residential',
                'size_mm' => 15,
                'manufacturer' => 'Sensus',
                'model' => 'Meitwin',
                'installation_date' => '2022-09-15',
                'status' => 'decommissioned',
                'last_reading' => 2150.00,
                'last_reading_date' => '2024-10-01',
                'address_id' => $addresses[0]->id ?? null,
            ],
            [
                'meter_number' => 'MTR-2024-008',
                'meter_type' => 'commercial',
                'size_mm' => 32,
                'manufacturer' => 'Elster',
                'model' => 'Amco C700',
                'installation_date' => '2023-05-20',
                'status' => 'active',
                'last_reading' => 7890.25,
                'last_reading_date' => '2024-11-20',
                'address_id' => $addresses[1]->id ?? null,
            ],
        ];

        foreach ($meters as $data) {
            Meter::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'meter_number' => $data['meter_number'],
                ],
                array_merge($data, ['tenant_id' => $tenant->id])
            );
        }
    }
}
