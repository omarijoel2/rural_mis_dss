<?php

namespace Database\Seeders;

use App\Models\Costing\GlAccount;
use App\Models\Costing\CostCenter;
use App\Models\Costing\BudgetVersion;
use App\Models\Costing\BudgetLine;
use App\Models\Costing\AllocationRule;
use App\Models\Costing\CostToServe;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class CostingSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('short_code', 'KWU')->first();
        if (!$tenant) {
            $this->command->warn('Tenant KWU not found. Skipping costing seeder.');
            return;
        }

        $user = User::where('tenant_id', $tenant->id)->first();
        if (!$user) {
            $this->command->warn('No user found for tenant. Skipping costing seeder.');
            return;
        }

        $this->seedGlAccounts($tenant);
        $this->seedCostCenters($tenant);
        $this->seedBudgetVersion($tenant, $user);
        $this->seedAllocationRules($tenant);
        $this->seedCostToServe($tenant);

        $this->command->info('Costing module seeded successfully with demo data');
    }

    private function seedGlAccounts(Tenant $tenant): void
    {
        $accounts = [
            ['code' => '1000', 'name' => 'Assets', 'type' => 'asset', 'parent_code' => null],
            ['code' => '1100', 'name' => 'Fixed Assets', 'type' => 'asset', 'parent_code' => '1000'],
            ['code' => '1110', 'name' => 'Water Infrastructure', 'type' => 'asset', 'parent_code' => '1100'],

            ['code' => '2000', 'name' => 'Liabilities', 'type' => 'liability', 'parent_code' => null],
            ['code' => '2100', 'name' => 'Current Liabilities', 'type' => 'liability', 'parent_code' => '2000'],

            ['code' => '3000', 'name' => 'Equity', 'type' => 'equity', 'parent_code' => null],

            ['code' => '4000', 'name' => 'Revenue', 'type' => 'revenue', 'parent_code' => null],
            ['code' => '4100', 'name' => 'Water Sales', 'type' => 'revenue', 'parent_code' => '4000'],
            ['code' => '4110', 'name' => 'Residential Water Sales', 'type' => 'revenue', 'parent_code' => '4100'],
            ['code' => '4120', 'name' => 'Commercial Water Sales', 'type' => 'revenue', 'parent_code' => '4100'],

            ['code' => '5000', 'name' => 'Operating Expenses', 'type' => 'expense', 'parent_code' => null],
            ['code' => '5100', 'name' => 'Production Costs', 'type' => 'expense', 'parent_code' => '5000'],
            ['code' => '5110', 'name' => 'Energy Costs', 'type' => 'expense', 'parent_code' => '5100'],
            ['code' => '5120', 'name' => 'Chemical Costs', 'type' => 'expense', 'parent_code' => '5100'],
            ['code' => '5200', 'name' => 'Personnel Costs', 'type' => 'expense', 'parent_code' => '5000'],
            ['code' => '5210', 'name' => 'Salaries & Wages', 'type' => 'expense', 'parent_code' => '5200'],
            ['code' => '5300', 'name' => 'Maintenance Costs', 'type' => 'expense', 'parent_code' => '5000'],
            ['code' => '5310', 'name' => 'Preventive Maintenance', 'type' => 'expense', 'parent_code' => '5300'],
            ['code' => '5320', 'name' => 'Corrective Maintenance', 'type' => 'expense', 'parent_code' => '5300'],
        ];

        foreach ($accounts as $account) {
            $parentId = null;
            if ($account['parent_code']) {
                $parent = GlAccount::where('tenant_id', $tenant->id)
                    ->where('code', $account['parent_code'])
                    ->first();
                if (!$parent) {
                    $this->command->warn("  - Parent account {$account['parent_code']} not found for {$account['code']}");
                }
                $parentId = $parent?->id;
            }

            GlAccount::updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $account['code']],
                [
                    'name' => $account['name'],
                    'type' => $account['type'],
                    'parent_id' => $parentId,
                    'active' => true,
                ]
            );
        }

        $this->command->info('  - GL Accounts created');
    }

    private function seedCostCenters(Tenant $tenant): void
    {
        $centers = [
            ['code' => 'CC-100', 'name' => 'Production Department', 'parent_id' => null],
            ['code' => 'CC-110', 'name' => 'Water Treatment Plant 1', 'parent_id' => null],
            ['code' => 'CC-120', 'name' => 'Water Treatment Plant 2', 'parent_id' => null],
            ['code' => 'CC-200', 'name' => 'Distribution Department', 'parent_id' => null],
            ['code' => 'CC-210', 'name' => 'Network Maintenance', 'parent_id' => null],
            ['code' => 'CC-220', 'name' => 'Pump Stations', 'parent_id' => null],
            ['code' => 'CC-300', 'name' => 'Commercial Department', 'parent_id' => null],
            ['code' => 'CC-310', 'name' => 'Billing & Collections', 'parent_id' => null],
            ['code' => 'CC-400', 'name' => 'Administration', 'parent_id' => null],
            ['code' => 'CC-410', 'name' => 'Finance & Accounting', 'parent_id' => null],
        ];

        foreach ($centers as $center) {
            CostCenter::firstOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $center['code']],
                [
                    'name' => $center['name'],
                    'parent_id' => $center['parent_id'],
                    'active' => true,
                ]
            );
        }

        $this->command->info('  - Cost Centers created');
    }

    private function seedBudgetVersion(Tenant $tenant, User $user): void
    {
        $version = BudgetVersion::firstOrCreate(
            ['tenant_id' => $tenant->id, 'fiscal_year' => 2025],
            [
                'name' => 'FY 2025 Operating Budget',
                'status' => 'draft',
                'is_rolling' => false,
                'created_by' => $user->id,
            ]
        );

        $energyAccount = GlAccount::where('tenant_id', $tenant->id)->where('code', '5110')->first();
        $chemicalAccount = GlAccount::where('tenant_id', $tenant->id)->where('code', '5120')->first();
        $salariesAccount = GlAccount::where('tenant_id', $tenant->id)->where('code', '5210')->first();
        $productionCenter = CostCenter::where('tenant_id', $tenant->id)->where('code', 'CC-100')->first();
        $adminCenter = CostCenter::where('tenant_id', $tenant->id)->where('code', 'CC-400')->first();

        if ($energyAccount && $productionCenter) {
            for ($month = 1; $month <= 12; $month++) {
                BudgetLine::firstOrCreate(
                    [
                        'version_id' => $version->id,
                        'cost_center_id' => $productionCenter->id,
                        'gl_account_id' => $energyAccount->id,
                        'period' => sprintf('2025-%02d', $month),
                    ],
                    ['amount' => 450000 + rand(-50000, 50000)]
                );
            }
        }

        if ($chemicalAccount && $productionCenter) {
            for ($month = 1; $month <= 12; $month++) {
                BudgetLine::firstOrCreate(
                    [
                        'version_id' => $version->id,
                        'cost_center_id' => $productionCenter->id,
                        'gl_account_id' => $chemicalAccount->id,
                        'period' => sprintf('2025-%02d', $month),
                    ],
                    ['amount' => 180000 + rand(-20000, 20000)]
                );
            }
        }

        if ($salariesAccount && $adminCenter) {
            for ($month = 1; $month <= 12; $month++) {
                BudgetLine::firstOrCreate(
                    [
                        'version_id' => $version->id,
                        'cost_center_id' => $adminCenter->id,
                        'gl_account_id' => $salariesAccount->id,
                        'period' => sprintf('2025-%02d', $month),
                    ],
                    ['amount' => 850000 + rand(-50000, 50000)]
                );
            }
        }

        $this->command->info('  - Budget Version and Lines created');
    }

    private function seedAllocationRules(Tenant $tenant): void
    {
        $rules = [
            [
                'name' => 'Allocate Energy Costs by Production',
                'basis' => 'equal',
                'applies_to' => 'energy_costs',
                'active' => true,
            ],
            [
                'name' => 'Allocate Admin Costs by Headcount',
                'basis' => 'percentage',
                'percentage' => 100.0,
                'applies_to' => 'admin_costs',
                'active' => true,
            ],
            [
                'name' => 'Allocate Maintenance by Asset Value',
                'basis' => 'equal',
                'applies_to' => 'maintenance',
                'active' => false,
            ],
        ];

        foreach ($rules as $rule) {
            AllocationRule::firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $rule['name']],
                [
                    'basis' => $rule['basis'],
                    'percentage' => $rule['percentage'] ?? null,
                    'applies_to' => $rule['applies_to'],
                    'active' => $rule['active'],
                ]
            );
        }

        $this->command->info('  - Allocation Rules created');
    }

    private function seedCostToServe(Tenant $tenant): void
    {
        for ($month = 1; $month <= 6; $month++) {
            $production = 850000 + rand(-100000, 100000);
            $billed = $production * (0.78 + (rand(0, 5) / 100));
            $opex = 3200000 + rand(-300000, 300000);
            $capex = 450000 + rand(-50000, 50000);
            $energy = 1200000 + rand(-100000, 100000);
            $chemical = 280000 + rand(-30000, 30000);
            $other = 1270000 + rand(-150000, 150000);
            $revenue = $billed * 85;

            CostToServe::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'period' => sprintf('2025-%02d', $month),
                ],
                [
                    'production_m3' => $production,
                    'billed_m3' => $billed,
                    'opex_cost' => $opex,
                    'capex_depr' => $capex,
                    'energy_kwh' => $energy / 12,
                    'energy_cost' => $energy,
                    'chemical_cost' => $chemical,
                    'other_cost' => $other,
                    'cost_per_m3' => ($opex + $capex) / $production,
                    'revenue_per_m3' => $revenue / $billed,
                    'margin_per_m3' => ($revenue / $billed) - (($opex + $capex) / $production),
                ]
            );
        }

        $this->command->info('  - Cost-to-Serve metrics created');
    }
}
