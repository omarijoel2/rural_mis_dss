<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RBACPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Users & RBAC
            'rbac.view' => 'View RBAC admin pages',
            'rbac.manage' => 'Create/update/delete roles, permissions, assignments',
            'rbac.impersonate' => 'Impersonate users (with audit)',
            
            // Audit
            'audit.view' => 'View audit logs',
            'audit.export' => 'Export audit logs CSV',
            
            // Tenants
            'tenant.view' => 'View tenants',
            'tenant.manage' => 'Create/update tenants; assign domains',
            
            // Core Operations
            'coreops.view' => 'Read core operations data',
            'coreops.manage' => 'Create/update/delete core ops entities',
            
            // Core Registry (Schemes, Facilities, DMAs, Pipelines, Zones, Addresses)
            'core.schemes.view' => 'View schemes',
            'core.schemes.create' => 'Create schemes',
            'core.schemes.edit' => 'Edit schemes',
            'core.schemes.delete' => 'Delete schemes',
            'core.facilities.view' => 'View facilities',
            'core.facilities.create' => 'Create facilities',
            'core.facilities.edit' => 'Edit facilities',
            'core.facilities.delete' => 'Delete facilities',
            'core.dmas.view' => 'View DMAs',
            'core.dmas.create' => 'Create DMAs',
            'core.dmas.edit' => 'Edit DMAs',
            'core.dmas.delete' => 'Delete DMAs',
            'core.pipelines.view' => 'View pipelines',
            'core.pipelines.create' => 'Create pipelines',
            'core.pipelines.edit' => 'Edit pipelines',
            'core.pipelines.delete' => 'Delete pipelines',
            
            // Water Quality
            'wq.view' => 'Read LIMS/WQ data',
            'wq.manage' => 'Manage WQ setup & results',
            'wq.samples.view' => 'View water samples',
            'wq.samples.create' => 'Create water samples',
            'wq.results.view' => 'View test results',
            'wq.results.approve' => 'Approve test results',
            
            // Finance & Costing
            'finance.view' => 'View finance pages',
            'finance.manage' => 'Manage finance artifacts',
            'costing.budgets.view' => 'View budgets',
            'costing.budgets.create' => 'Create budgets',
            'costing.budgets.edit' => 'Edit budgets',
            'costing.budgets.delete' => 'Delete budgets',
            'costing.budgets.approve' => 'Approve budgets',
            'costing.allocations.view' => 'View cost allocations',
            'costing.allocations.create' => 'Create allocation rules',
            'costing.allocations.run' => 'Run cost allocations',
            'costing.cost-to-serve.view' => 'View cost-to-serve analytics',
            
            // GIS
            'gis.view' => 'View GIS layers',
            'gis.edit' => 'Edit GIS features/redlines',
            'gis.export' => 'Export GIS data',
            
            // CRM & Revenue Assurance
            'crm.view' => 'View tickets/CRM',
            'crm.manage' => 'Manage tickets, SLAs',
            'crm.customers.view' => 'View customers',
            'crm.customers.create' => 'Create customers',
            'crm.customers.edit' => 'Edit customers',
            'crm.customers.delete' => 'Delete customers',
            'crm.ra.view' => 'View revenue assurance cases',
            'crm.ra.investigate' => 'Investigate RA cases',
            'crm.ra.approve' => 'Approve RA actions',
            'crm.billing.view' => 'View billing/invoices',
            'crm.billing.import' => 'Import billing data',
            'crm.payments.view' => 'View payments',
            'crm.payments.import' => 'Import payment data',
            'crm.dunning.view' => 'View dunning & collections',
            'crm.dunning.manage' => 'Manage dunning workflows',
            
            // CMMS (Asset Management)
            'cmms.view' => 'View assets and maintenance',
            'cmms.manage' => 'Manage assets and work orders',
            'cmms.assets.view' => 'View assets',
            'cmms.assets.create' => 'Create assets',
            'cmms.assets.edit' => 'Edit assets',
            'cmms.assets.delete' => 'Delete assets',
            'cmms.workorders.view' => 'View work orders',
            'cmms.workorders.create' => 'Create work orders',
            'cmms.workorders.assign' => 'Assign work orders',
            'cmms.workorders.complete' => 'Complete work orders',
            
            // Hydro-Meteorological & Water Sources
            'hydromet.view' => 'View hydro-met data',
            'hydromet.manage' => 'Manage hydro-met data',
            'hydromet.sources.view' => 'View water sources',
            'hydromet.sources.create' => 'Create water sources',
            'hydromet.sources.edit' => 'Edit water sources',
            'hydromet.stations.view' => 'View monitoring stations',
            'hydromet.stations.create' => 'Create monitoring stations',
            'hydromet.sensors.manage' => 'Manage sensors',
            
            // Projects & Capital Planning
            'projects.view' => 'View projects',
            'projects.create' => 'Create projects',
            'projects.edit' => 'Edit projects',
            'projects.approve' => 'Approve projects',
            'projects.contracts.view' => 'View contracts',
            'projects.contracts.manage' => 'Manage contracts',
            
            // Integration & Platform
            'integration.api.view' => 'View API catalog',
            'integration.api.manage' => 'Manage APIs and keys',
            'integration.webhooks.view' => 'View webhooks',
            'integration.webhooks.manage' => 'Manage webhooks',
            'integration.connectors.view' => 'View connectors',
            'integration.connectors.manage' => 'Manage connector setup',
            'integration.etl.view' => 'View ETL jobs',
            'integration.etl.manage' => 'Manage ETL jobs',
            'integration.dw.view' => 'View data warehouse catalog',
            'integration.comms.view' => 'View communication templates',
            'integration.comms.manage' => 'Manage communication templates',
            'integration.comms.send' => 'Send communications',
            
            // Security & Compliance
            'security.view' => 'View security settings',
            'security.manage' => 'Manage security policies',
            'security.secrets.view' => 'View secrets vault',
            'security.secrets.manage' => 'Manage secrets',
        ];

        // Create all permissions
        foreach ($permissions as $name => $description) {
            \Spatie\Permission\Models\Permission::updateOrCreate(
                ['name' => $name],
                ['guard_name' => 'web']
            );
        }

        // Create roles
        $roles = [
            'Admin' => ['rbac.manage', 'audit.export', 'tenant.manage', 'security.manage', 'security.secrets.manage'],
            'Manager' => ['rbac.view', 'audit.view'],
            'Operator' => ['coreops.manage', 'crm.manage', 'cmms.workorders.assign', 'cmms.workorders.complete'],
            'Analyst' => ['gis.view', 'finance.view', 'wq.view', 'costing.budgets.view', 'costing.allocations.view', 'costing.cost-to-serve.view'],
            'Viewer' => []
        ];

        foreach ($roles as $roleName => $basePermissions) {
            $role = \Spatie\Permission\Models\Role::updateOrCreate(
                ['name' => $roleName],
                ['guard_name' => 'web']
            );

            // Admin gets all permissions
            if ($roleName === 'Admin') {
                $role->syncPermissions(\Spatie\Permission\Models\Permission::all());
            } else if ($roleName === 'Viewer') {
                // Viewer gets all .view permissions
                $viewPermissions = \Spatie\Permission\Models\Permission::where('name', 'like', '%.view')->get();
                $role->syncPermissions($viewPermissions);
            } else if ($roleName === 'Manager') {
                // Manager gets view + manage for most domains
                $managerPerms = \Spatie\Permission\Models\Permission::whereIn('name', array_merge($basePermissions, [
                    'core.schemes.view', 'core.schemes.edit',
                    'core.facilities.view', 'core.facilities.edit',
                    'core.dmas.view', 'core.dmas.edit',
                    'wq.view', 'wq.manage',
                    'finance.view', 'finance.manage',
                    'crm.view', 'crm.customers.view', 'crm.customers.edit',
                    'projects.view', 'projects.edit',
                ]))->get();
                $role->syncPermissions($managerPerms);
            } else if ($roleName === 'Analyst') {
                $analystPerms = \Spatie\Permission\Models\Permission::whereIn('name', array_merge($basePermissions, [
                    'core.schemes.view', 'core.facilities.view', 'core.dmas.view',
                    'crm.view', 'crm.customers.view', 'crm.billing.view', 'crm.payments.view',
                    'projects.view',
                    'hydromet.view',
                ]))->get();
                $role->syncPermissions($analystPerms);
            } else if ($roleName === 'Operator') {
                $operatorPerms = \Spatie\Permission\Models\Permission::whereIn('name', array_merge($basePermissions, [
                    'core.facilities.view', 'core.facilities.edit',
                    'wq.samples.view', 'wq.samples.create',
                    'cmms.view', 'cmms.assets.view', 'cmms.workorders.view',
                    'crm.customers.view',
                ]))->get();
                $role->syncPermissions($operatorPerms);
            }
        }

        $this->command->info('✓ Created ' . count($permissions) . ' permissions and ' . count($roles) . ' roles');
    }
}
