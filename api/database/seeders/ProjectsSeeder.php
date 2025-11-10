<?php

namespace Database\Seeders;

use App\Models\Projects\Project;
use App\Models\Projects\ProjectCategory;
use App\Models\Projects\InvestmentPipeline;
use App\Models\Projects\InvestmentAppraisal;
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

        $this->seedProjectCategories($tenant);
        $this->seedProjects($tenant, $user);
        $this->seedInvestmentPipelines($tenant, $user);
        $this->seedLandCategories($tenant);
        $this->seedLandParcels($tenant, $user);

        $this->command->info('Module 9: Projects & Capital Planning seeded successfully with demo data');
    }

    private function seedProjectCategories(Tenant $tenant): void
    {
        $categories = [
            ['code' => 'NEW', 'name' => 'New Scheme', 'description' => 'New water supply infrastructure'],
            ['code' => 'EXT', 'name' => 'Extension', 'description' => 'Extension of existing infrastructure'],
            ['code' => 'REH', 'name' => 'Rehabilitation', 'description' => 'Rehabilitation of existing assets'],
            ['code' => 'UPG', 'name' => 'Upgrade', 'description' => 'Upgrade and modernization projects'],
            ['code' => 'EMG', 'name' => 'Emergency', 'description' => 'Emergency response projects'],
        ];

        foreach ($categories as $data) {
            ProjectCategory::firstOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                ['name' => $data['name'], 'description' => $data['description'], 'active' => true]
            );
        }

        $this->command->info('  - Project Categories created');
    }

    private function seedProjects(Tenant $tenant, User $user): void
    {
        $newCategory = ProjectCategory::where('tenant_id', $tenant->id)->where('code', 'NEW')->first();
        $extCategory = ProjectCategory::where('tenant_id', $tenant->id)->where('code', 'EXT')->first();
        $rehCategory = ProjectCategory::where('tenant_id', $tenant->id)->where('code', 'REH')->first();

        $projects = [
            [
                'code' => 'PROJ-2025-001',
                'title' => 'New Water Treatment Plant - Nyamira',
                'description' => 'Construction of a 5,000 m³/day water treatment plant to serve Nyamira town',
                'category_id' => $newCategory?->id,
                'baseline_budget' => 85000000,
                'baseline_start_date' => '2025-03-01',
                'baseline_end_date' => '2026-06-30',
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
                'title' => 'Distribution Network Extension - Keroka',
                'description' => 'Extension of distribution network to serve 500 new connections',
                'category_id' => $extCategory?->id,
                'baseline_budget' => 12500000,
                'baseline_start_date' => '2025-04-15',
                'baseline_end_date' => '2025-12-31',
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
                'title' => 'Borehole Rehabilitation - Magwagwa',
                'description' => 'Rehabilitation of 3 boreholes including pump replacement and casing repair',
                'category_id' => $rehCategory?->id,
                'baseline_budget' => 4200000,
                'baseline_start_date' => '2024-10-01',
                'baseline_end_date' => '2025-02-28',
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
        $upgCategory = ProjectCategory::where('tenant_id', $tenant->id)->where('code', 'UPG')->first();
        $emgCategory = ProjectCategory::where('tenant_id', $tenant->id)->where('code', 'EMG')->first();

        $pipelines = [
            [
                'code' => 'INV-2025-001',
                'title' => 'Solar-Powered Pumping Station - Rioma',
                'description' => 'Installation of 50kW solar-powered pumping station to reduce energy costs',
                'category_id' => $upgCategory?->id,
                'estimated_cost' => 8500000,
                'currency' => 'KES',
                'connections_added' => 850,
                'energy_savings' => 2400000,
                'nrw_reduction' => 5.0,
                'revenue_increase' => 1200000,
                'priority_score' => 85.5,
                'location' => new Point(-0.782, 34.721),
                'status' => 'active',
                'created_by' => $user->id,
            ],
            [
                'code' => 'INV-2025-002',
                'title' => 'Leak Detection System Deployment',
                'description' => 'Installation of smart leak detection sensors across 5 DMAs',
                'category_id' => $upgCategory?->id,
                'estimated_cost' => 6200000,
                'currency' => 'KES',
                'connections_added' => 0,
                'energy_savings' => 0,
                'nrw_reduction' => 15.0,
                'revenue_increase' => 1800000,
                'npv' => 3800000,
                'bcr' => 1.85,
                'irr' => 18.5,
                'priority_score' => 72.3,
                'location' => new Point(-0.567, 34.933),
                'status' => 'shortlisted',
                'created_by' => $user->id,
            ],
            [
                'code' => 'INV-2025-003',
                'title' => 'Emergency Tanker Supply - Drought Mitigation',
                'description' => 'Emergency water supply via tankers for drought-affected areas',
                'category_id' => $emgCategory?->id,
                'estimated_cost' => 3500000,
                'currency' => 'KES',
                'connections_added' => 0,
                'priority_score' => 95.0,
                'location' => new Point(-0.645, 34.965),
                'status' => 'approved',
                'created_by' => $user->id,
                'approved_by' => $user->id,
                'approved_at' => now()->subDays(5),
            ],
        ];

        foreach ($pipelines as $data) {
            $pipeline = InvestmentPipeline::firstOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $data['code']],
                $data
            );

            // Create appraisal for shortlisted pipelines
            if ($data['status'] === 'shortlisted') {
                InvestmentAppraisal::firstOrCreate(
                    ['pipeline_id' => $pipeline->id],
                    [
                        'appraisal_no' => 'APP-2025-' . str_pad($pipeline->id, 3, '0', STR_PAD_LEFT),
                        'appraiser_id' => $user->id,
                        'appraisal_date' => now()->subDays(15),
                        'executive_summary' => 'Financial appraisal for ' . $data['title'],
                        'capex' => $data['estimated_cost'],
                        'opex_annual' => $data['estimated_cost'] * 0.05,
                        'project_life_years' => 10,
                        'discount_rate' => 0.12,
                        'calculated_npv' => 3800000,
                        'calculated_bcr' => 1.85,
                        'calculated_irr' => 0.185,
                        'cash_flows' => json_encode([
                            'year_0' => ['cost' => $data['estimated_cost'] * 0.3, 'benefit' => 0],
                            'year_1' => ['cost' => $data['estimated_cost'] * 0.5, 'benefit' => 1800000 * 0.6],
                            'year_2' => ['cost' => $data['estimated_cost'] * 0.2, 'benefit' => 1800000 * 0.8],
                            'year_3' => ['cost' => 0, 'benefit' => 1800000],
                        ]),
                        'risks' => 'Market risk, implementation delay risk',
                        'assumptions' => 'Stable market conditions, timely implementation',
                        'recommendation' => 'approve',
                        'recommendation_notes' => 'Project shows strong financial viability with positive NPV and acceptable BCR',
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
                'title_number' => 'NYAMIRA/NYAMIRA/12345',
                'title_status' => 'freehold',
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
                'title_number' => 'NYAMIRA/NYAMIRA/12346',
                'title_status' => 'freehold',
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
