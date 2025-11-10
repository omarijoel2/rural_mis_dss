<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class CostingPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_gl_accounts',
            'create_gl_accounts',
            'edit_gl_accounts',
            'delete_gl_accounts',

            'view_cost_centers',
            'create_cost_centers',
            'edit_cost_centers',
            'delete_cost_centers',

            'view_budgets',
            'create_budgets',
            'edit_budgets',
            'delete_budgets',
            'approve_budgets',

            'view_budget_lines',
            'create_budget_lines',
            'edit_budget_lines',
            'delete_budget_lines',

            'view_allocation_rules',
            'create_allocation_rules',
            'edit_allocation_rules',
            'delete_allocation_rules',

            'view_allocation_runs',
            'create_allocation_runs',
            'edit_allocation_runs',
            'delete_allocation_runs',

            'view_cost_to_serve',
            'create_cost_to_serve',
            'edit_cost_to_serve',
            'delete_cost_to_serve',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->command->info('Costing & Budgeting permissions created successfully');
    }
}
