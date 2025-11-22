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
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use Illuminate\Support\Str;

class GarissaTenantSeeder extends Seeder
{
    /**
     * Run the database seeds for Garissa County
     */
    public function run(): void
    {
        // Create Garissa County tenant
        $tenant = Tenant::updateOrCreate(
            ['short_code' => 'GWC'],
            [
                'name' => 'Garissa Water & Sanitation Company',
                'short_code' => 'GWC',
                'country' => 'KE',
                'timezone' => 'Africa/Nairobi',
                'currency' => 'KES',
                'status' => 'active',
            ]
        );

        $this->command->info('Tenant: ' . $tenant->name);

        // Create organization
        $org = Organization::updateOrCreate(
            ['tenant_id' => $tenant->id, 'org_code' => 'GWC'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Garissa Water & Sanitation Company',
                'org_code' => 'GWC',
                'type' => 'utility',
            ]
        );

        $this->seedSchemes($tenant, $org);
        $this->seedDmas($tenant);
        $this->seedFacilities($tenant);
        $this->seedZones($tenant);
        $this->seedPipelines($tenant);
        $this->seedAddresses($tenant);

        $this->command->info('Garissa county data seeded successfully!');
    }

    private function seedSchemes(Tenant $tenant, Organization $org): void
    {
        $this->command->info('Seeding Garissa schemes...');

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

        $this->command->info('Created 4 schemes for Garissa');
    }

    private function seedDmas(Tenant $tenant): void
    {
        $this->command->info('Seeding Garissa DMAs...');

        // Get the main Garissa scheme
        $mainScheme = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'GCWSS-001')
            ->first();

        if (!$mainScheme) {
            $this->command->warn('Main Garissa scheme not found. Skipping DMAs.');
            return;
        }

        $dmas = [
            [
                'code' => 'DMA-G1-TOWN',
                'name' => 'DMA Zone 1 - Garissa Town',
                'scheme_id' => $mainScheme->id,
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
                'scheme_id' => $mainScheme->id,
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
                'scheme_id' => $mainScheme->id,
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
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, [
                    'tenant_id' => $tenant->id,
                ])
            );
        }

        $this->command->info('Created 3 DMAs for Garissa');
    }

    private function seedFacilities(Tenant $tenant): void
    {
        $this->command->info('Seeding Garissa facilities...');

        $mainScheme = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'GCWSS-001')
            ->first();

        if (!$mainScheme) {
            $this->command->warn('Main scheme not found. Skipping facilities.');
            return;
        }

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
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, [
                    'tenant_id' => $tenant->id,
                    'scheme_id' => $mainScheme->id,
                ])
            );
        }

        $this->command->info('Created 5 facilities for Garissa');
    }

    private function seedZones(Tenant $tenant): void
    {
        $this->command->info('Seeding Garissa zones...');

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
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, [
                    'tenant_id' => $tenant->id,
                ])
            );
        }

        $this->command->info('Created 2 zones for Garissa');
    }

    private function seedPipelines(Tenant $tenant): void
    {
        $this->command->info('Seeding Garissa pipelines...');

        $mainScheme = Scheme::where('tenant_id', $tenant->id)
            ->where('code', 'GCWSS-001')
            ->first();

        if (!$mainScheme) {
            $this->command->warn('Main scheme not found. Skipping pipelines.');
            return;
        }

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
                [
                    'tenant_id' => $tenant->id,
                    'code' => $data['code'],
                ],
                array_merge($data, [
                    'tenant_id' => $tenant->id,
                    'scheme_id' => $mainScheme->id,
                ])
            );
        }

        $this->command->info('Created 3 pipelines for Garissa');
    }

    private function seedAddresses(Tenant $tenant): void
    {
        $this->command->info('Seeding Garissa addresses...');

        $addresses = [
            [
                'premise_code' => 'HQ-001',
                'street' => 'Kenyatta Avenue',
                'city' => 'Garissa',
                'postcode' => '70100',
                'country' => 'KE',
                'location' => new Point(39.655, -0.455, 4326),
            ],
            [
                'premise_code' => 'WTP-001',
                'street' => 'Tana River Road',
                'city' => 'Garissa',
                'postcode' => '70100',
                'country' => 'KE',
                'location' => new Point(39.64, -0.45, 4326),
            ],
            [
                'premise_code' => 'SRC-001',
                'street' => 'Garissa-Lamu Road',
                'city' => 'Garissa',
                'postcode' => '70100',
                'country' => 'KE',
                'location' => new Point(39.55, -0.50, 4326),
            ],
        ];

        foreach ($addresses as $data) {
            Address::create(array_merge($data, [
                'tenant_id' => $tenant->id,
            ]));
        }

        $this->command->info('Created 3 addresses for Garissa');
    }
}
