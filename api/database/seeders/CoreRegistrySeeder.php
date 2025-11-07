<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Organization;
use App\Models\Scheme;
use App\Models\Dma;
use App\Models\Facility;
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
        $tenant = Tenant::first();
        if (!$tenant) {
            $this->command->error('No tenant found. Please create a tenant first.');
            return;
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
                        new Point(-1.25, 36.75),
                        new Point(-1.25, 36.85),
                        new Point(-1.35, 36.85),
                        new Point(-1.35, 36.75),
                        new Point(-1.25, 36.75),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(-1.30, 36.80, 4326),
            ],
            [
                'code' => 'WWSS-002',
                'name' => 'Westlands Water Supply Scheme',
                'type' => 'urban',
                'status' => 'active',
                'population_estimate' => 450000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(-1.24, 36.78),
                        new Point(-1.24, 36.83),
                        new Point(-1.28, 36.83),
                        new Point(-1.28, 36.78),
                        new Point(-1.24, 36.78),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(-1.26, 36.805, 4326),
            ],
            [
                'code' => 'KRWP-003',
                'name' => 'Kikuyu Rural Water Project',
                'type' => 'rural',
                'status' => 'active',
                'population_estimate' => 85000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(-1.20, 36.62),
                        new Point(-1.20, 36.72),
                        new Point(-1.28, 36.72),
                        new Point(-1.28, 36.62),
                        new Point(-1.20, 36.62),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(-1.24, 36.67, 4326),
            ],
            [
                'code' => 'TWSS-004',
                'name' => 'Thika Water & Sanitation Scheme',
                'type' => 'urban',
                'status' => 'planning',
                'population_estimate' => 250000,
                'geom' => new Polygon([
                    new LineString([
                        new Point(-1.00, 37.05),
                        new Point(-1.00, 37.15),
                        new Point(-1.08, 37.15),
                        new Point(-1.08, 37.05),
                        new Point(-1.00, 37.05),
                    ], 4326)
                ], 4326),
                'centroid' => new Point(-1.04, 37.10, 4326),
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
        $schemes = Scheme::where('tenant_id', $tenant->id)->get();
        
        if ($schemes->isEmpty()) {
            return;
        }

        $nairobi = $schemes->first();
        
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
                        new Point(-1.28, 36.80),
                        new Point(-1.28, 36.83),
                        new Point(-1.30, 36.83),
                        new Point(-1.30, 36.80),
                        new Point(-1.28, 36.80),
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
                        new Point(-1.29, 36.76),
                        new Point(-1.29, 36.80),
                        new Point(-1.32, 36.80),
                        new Point(-1.32, 36.76),
                        new Point(-1.29, 36.76),
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
                        new Point(-1.26, 36.85),
                        new Point(-1.26, 36.90),
                        new Point(-1.30, 36.90),
                        new Point(-1.30, 36.85),
                        new Point(-1.26, 36.85),
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
        $schemes = Scheme::where('tenant_id', $tenant->id)->get();
        
        if ($schemes->isEmpty()) {
            return;
        }

        $nairobi = $schemes->first();

        $facilities = [
            [
                'code' => 'FAC-SWTP-001',
                'name' => 'Sasumua Water Treatment Plant',
                'category' => 'treatment',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-1.10, 36.65, 4326),
            ],
            [
                'code' => 'FAC-NSS-002',
                'name' => 'Ngethu Spring Source',
                'category' => 'source',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-1.08, 36.68, 4326),
            ],
            [
                'code' => 'FAC-GPS-003',
                'name' => 'Gigiri Pumping Station',
                'category' => 'pumpstation',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-1.24, 36.78, 4326),
            ],
            [
                'code' => 'FAC-RSR-004',
                'name' => 'Ruaraka Service Reservoir',
                'category' => 'reservoir',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-1.25, 36.88, 4326),
            ],
            [
                'code' => 'FAC-KBS-005',
                'name' => 'Kabete Booster Station',
                'category' => 'pumpstation',
                'status' => 'standby',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-1.26, 36.73, 4326),
            ],
            [
                'code' => 'FAC-KWQL-006',
                'name' => 'Karura Water Quality Lab',
                'category' => 'lab',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-1.25, 36.82, 4326),
            ],
            [
                'code' => 'FAC-NDS-007',
                'name' => 'Ndakaini Dam Source',
                'category' => 'source',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-0.75, 37.05, 4326),
            ],
            [
                'code' => 'FAC-CPR-008',
                'name' => 'City Park Reservoir',
                'category' => 'reservoir',
                'status' => 'active',
                'scheme_id' => $nairobi->id,
                'location' => new Point(-1.27, 36.83, 4326),
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
}
