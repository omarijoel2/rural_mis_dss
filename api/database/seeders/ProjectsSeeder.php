<?php

namespace Database\Seeders;

use App\Models\Projects\Project;
use App\Models\Projects\InvestmentPipeline;
use App\Models\Projects\Appraisal;
use App\Models\Projects\LandCategory;
use App\Models\Projects\LandParcel;
use App\Models\Projects\Wayleave;
use App\Models\Projects\Compensation;
use App\Models\Projects\LandDispute;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Objects\LineString;

class ProjectsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('short_code', 'KWU')->first();
        if (!$tenant) {
            $this->command->warn('Tenant KWU not found. Skipping projects seeder.');
            return;
        }

        $user = User::where('tenant_id', $tenant->id)->first();
        if (!$user) {
            $this->command->warn('No user found for tenant. Skipping projects seeder.');
            return;
        }

        $this->seedProjects($tenant, $user);
        $this->seedInvestmentPipelines($tenant, $user);
        $this->seedLandCategories($tenant);
        $this->seedLandParcels($tenant, $user);

        $this->command->info('Module 9: Projects & Capital Planning seeded successfully with demo data');
    }

    private function seedProjects(Tenant $tenant, User $user): void
    {
        $projects = [
            [
                'code' => 'PROJ-2025-001',
                'name' => 'New Water Treatment Plant - Nyamira',
                'description' => 'Construction of a 5,000 m³/day water treatment plant to serve Nyamira town',
                'category' => 'new_scheme',
                'estimated_cost' => 85000000,
                'budget_year' => 2025,
                'start_date' => '2025-03-01',
                'end_date' => '2026-06-30',
                'status' => 'planning',
                'location' => new Polygon([
                    new LineString([
                        new Point(-0.567, 34.933),
                        new Point(-0.567, 34.938),
                        new Point(-0.572, 34.938),
                        new Point(-0.572, 34.933),
                        new Point(-0.567, 34.933),
                    ]),
                ]),
            ],
            [
                'code' => 'PROJ-2025-002',
                'name' => 'Distribution Network Extension - Keroka',
                'description' => 'Extension of distribution network to serve 500 new connections',
                'category' => 'extension',
                'estimated_cost' => 12500000,
                'budget_year' => 2025,
                'start_date' => '2025-04-15',
                'end_date' => '2025-12-31',
                'actual_start_date' => '2025-04-20',
                'physical_progress' => 35.00,
                'financial_progress' => 28.00,
                'status' => 'execution',
                'location' => new Polygon([
                    new LineString([
                        new Point(-0.755, 34.948),
                        new Point(-0.755, 34.952),
                        new Point(-0.759, 34.952),
                        new Point(-0.759, 34.948),
                        new Point(-0.755, 34.948),
                    ]),
                ]),
            ],
            [
                'code' => 'PROJ-2024-015',
                'name' => 'Borehole Rehabilitation - Magwagwa',
                'description' => 'Rehabilitation of 3 boreholes including pump replacement and casing repair',
                'category' => 'rehabilitation',
                'estimated_cost' => 4200000,
                'budget_year' => 2024,
                'start_date' => '2024-10-01',
                'end_date' => '2025-02-28',
                'actual_start_date' => '2024-10-05',
                'actual_end_date' => '2025-02-10',
                'physical_progress' => 100.00,
                'financial_progress' => 98.50,
                'status' => 'completed',
                'location' => new Polygon([
                    new LineString([
                        new Point(-0.645, 34.965),
                        new Point(-0.645, 34.970),
                        new Point(-0.650, 34.970),
                        new Point(-0.650, 34.965),
                        new Point(-0.645, 34.965),
                    ]),
                ]),
            ],
        ];

        foreach ($projects as $data) {
            Project::firstOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                array_merge($data, ['created_by' => $user->id])
            );
        }

        $this->command->info('  - Projects created');
    }

    private function seedInvestmentPipelines(Tenant $tenant, User $user): void
    {
        $pipelines = [
            [
                'name' => 'Solar-Powered Pumping Station - Rioma',
                'description' => 'Installation of 50kW solar-powered pumping station to reduce energy costs',
                'category' => 'upgrade',
                'priority' => 'high',
                'estimated_cost' => 8500000,
                'estimated_benefits' => 2400000,
                'discount_rate' => 12.0,
                'project_life_years' => 20,
                'location' => new Point(-0.782, 34.721),
                'beneficiaries' => 850,
                'status' => 'active',
            ],
            [
                'name' => 'Leak Detection System Deployment',
                'description' => 'Installation of smart leak detection sensors across 5 DMAs',
                'category' => 'upgrade',
                'priority' => 'medium',
                'estimated_cost' => 6200000,
                'estimated_benefits' => 1800000,
                'discount_rate' => 12.0,
                'project_life_years' => 10,
                'location' => new Point(-0.567, 34.933),
                'beneficiaries' => 2400,
                'status' => 'shortlisted',
            ],
            [
                'name' => 'Emergency Tanker Supply - Drought Mitigation',
                'description' => 'Emergency water supply via tankers for drought-affected areas',
                'category' => 'emergency',
                'priority' => 'high',
                'estimated_cost' => 3500000,
                'estimated_benefits' => null,
                'discount_rate' => null,
                'project_life_years' => 1,
                'location' => new Point(-0.645, 34.965),
                'beneficiaries' => 1200,
                'status' => 'approved',
            ],
        ];

        foreach ($pipelines as $data) {
            $pipeline = InvestmentPipeline::firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $data['name']],
                $data
            );

            // Create appraisal for shortlisted pipelines
            if ($data['status'] === 'shortlisted' && $data['discount_rate']) {
                Appraisal::firstOrCreate(
                    ['pipeline_id' => $pipeline->id],
                    [
                        'costs' => json_encode([
                            'year_0' => $data['estimated_cost'] * 0.3,
                            'year_1' => $data['estimated_cost'] * 0.5,
                            'year_2' => $data['estimated_cost'] * 0.2,
                        ]),
                        'benefits' => json_encode([
                            'year_1' => $data['estimated_benefits'] * 0.6,
                            'year_2' => $data['estimated_benefits'] * 0.8,
                            'year_3' => $data['estimated_benefits'],
                        ]),
                        'discount_rate' => $data['discount_rate'],
                        'project_life' => $data['project_life_years'],
                        'npv' => ($data['estimated_benefits'] * 5) - $data['estimated_cost'],
                        'bcr' => ($data['estimated_benefits'] * 5) / $data['estimated_cost'],
                        'irr' => 18.5,
                        'payback_period' => 3.5,
                        'appraiser_id' => $user->id,
                        'appraisal_date' => now()->subDays(15),
                    ]
                );
            }
        }

        $this->command->info('  - Investment Pipelines created');
    }

    private function seedLandCategories(Tenant $tenant): void
    {
        $categories = [
            ['code' => 'PRIV', 'name' => 'Private Land', 'description' => 'Privately owned land parcels'],
            ['code' => 'PUB', 'name' => 'Public Land', 'description' => 'Government or public entity owned land'],
            ['code' => 'COMM', 'name' => 'Community Land', 'description' => 'Communally owned land'],
            ['code' => 'TRUST', 'name' => 'Trust Land', 'description' => 'Land held in trust by county government'],
        ];

        foreach ($categories as $data) {
            LandCategory::firstOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                ['name' => $data['name'], 'description' => $data['description']]
            );
        }

        $this->command->info('  - Land Categories created');
    }

    private function seedLandParcels(Tenant $tenant, User $user): void
    {
        $privCategory = LandCategory::where('tenant_id', $tenant->id)->where('code', 'PRIV')->first();
        $project = Project::where('tenant_id', $tenant->id)->where('code', 'PROJ-2025-001')->first();

        $parcels = [
            [
                'ref_no' => 'NYAM/2025/001',
                'title_deed_no' => 'NYAMIRA/NYAMIRA/12345',
                'area_ha' => 2.5,
                'owner_name' => 'John Mwangi',
                'owner_contact' => '+254722123456',
                'boundary' => new Polygon([
                    new LineString([
                        new Point(-0.567, 34.933),
                        new Point(-0.567, 34.935),
                        new Point(-0.569, 34.935),
                        new Point(-0.569, 34.933),
                        new Point(-0.567, 34.933),
                    ]),
                ]),
                'county' => 'Nyamira',
                'sub_county' => 'Nyamira',
                'ward' => 'Township',
                'acquisition_status' => 'negotiation',
            ],
            [
                'ref_no' => 'NYAM/2025/002',
                'title_deed_no' => 'NYAMIRA/NYAMIRA/12346',
                'area_ha' => 1.8,
                'owner_name' => 'Mary Nyanchama',
                'owner_contact' => '+254733234567',
                'boundary' => new Polygon([
                    new LineString([
                        new Point(-0.569, 34.933),
                        new Point(-0.569, 34.935),
                        new Point(-0.571, 34.935),
                        new Point(-0.571, 34.933),
                        new Point(-0.569, 34.933),
                    ]),
                ]),
                'county' => 'Nyamira',
                'sub_county' => 'Nyamira',
                'ward' => 'Township',
                'acquisition_status' => 'acquired',
            ],
        ];

        foreach ($parcels as $data) {
            $parcel = LandParcel::firstOrCreate(
                ['tenant_id' => $tenant->id, 'ref_no' => $data['ref_no']],
                array_merge($data, [
                    'category_id' => $privCategory?->id,
                    'project_id' => $project?->id,
                    'created_by' => $user->id,
                ])
            );

            // Add wayleave for first parcel
            if ($data['ref_no'] === 'NYAM/2025/001') {
                Wayleave::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'wayleave_no' => 'WL-2025-001'],
                    [
                        'parcel_id' => $parcel->id,
                        'type' => 'pipeline',
                        'width_m' => 6.0,
                        'length_m' => 120.0,
                        'agreement_date' => now()->subDays(30),
                        'expiry_date' => now()->addYears(25),
                        'status' => 'active',
                        'annual_fee' => 50000,
                        'terms' => 'Standard wayleave agreement for water pipeline crossing',
                    ]
                );
            }

            // Add compensation for negotiation parcel
            if ($data['acquisition_status'] === 'negotiation') {
                Compensation::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'comp_no' => 'COMP-2025-001'],
                    [
                        'parcel_id' => $parcel->id,
                        'valuation_amount' => 3500000,
                        'negotiated_amount' => 3800000,
                        'paid_amount' => 0,
                        'comp_type' => 'land_acquisition',
                        'valuation_date' => now()->subDays(45),
                        'status' => 'negotiated',
                        'valuation_notes' => 'Valuation based on recent comparable sales in the area',
                        'valued_by' => $user->id,
                    ]
                );
            }
        }

        $this->command->info('  - Land Parcels, Wayleaves, and Compensations created');
    }
}
