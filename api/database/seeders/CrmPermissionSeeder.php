<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CrmPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view customers',
            'create customers',
            'edit customers',
            'delete customers',
            
            'view premises',
            'create premises',
            'edit premises',
            'delete premises',
            
            'view service connections',
            'create service connections',
            'edit service connections',
            'delete service connections',
            
            'view meters',
            'create meters',
            'edit meters',
            'delete meters',
            'record meter reads',
            
            'view invoices',
            'create invoices',
            'edit invoices',
            'void invoices',
            
            'view payments',
            'record payments',
            'reverse payments',
            
            'view payment plans',
            'create payment plans',
            'approve payment plans',
            'cancel payment plans',
            
            'view ra cases',
            'triage ra cases',
            'dispatch ra cases',
            'resolve ra cases',
            'close ra cases',
            
            'view ra rules',
            'create ra rules',
            'edit ra rules',
            'delete ra rules',
            'run ra rules',
            
            'view complaints',
            'create complaints',
            'assign complaints',
            'resolve complaints',
            'close complaints',
            
            'view interactions',
            'create interactions',
            
            'import billing data',
            'import mpesa data',
            'export crm data',
            
            'view dunning reports',
            'generate dunning notices',
            'mark for disconnection',
            'disconnect accounts',
            'reconnect accounts',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $crmManager = Role::firstOrCreate(['name' => 'CRM Manager']);
        $crmManager->givePermissionTo([
            'view customers', 'create customers', 'edit customers',
            'view premises', 'create premises', 'edit premises',
            'view service connections', 'create service connections', 'edit service connections',
            'view meters', 'create meters', 'edit meters', 'record meter reads',
            'view invoices', 'view payments', 'record payments',
            'view payment plans', 'create payment plans',
            'view complaints', 'create complaints', 'assign complaints',
            'view interactions', 'create interactions',
        ]);

        $revenueOfficer = Role::firstOrCreate(['name' => 'Revenue Officer']);
        $revenueOfficer->givePermissionTo([
            'view customers', 'view premises', 'view service connections',
            'view invoices', 'view payments', 'record payments',
            'view payment plans', 'create payment plans', 'approve payment plans',
            'view ra cases', 'triage ra cases', 'dispatch ra cases',
            'view dunning reports', 'generate dunning notices',
            'mark for disconnection',
        ]);

        $raAnalyst = Role::firstOrCreate(['name' => 'RA Analyst']);
        $raAnalyst->givePermissionTo([
            'view customers', 'view premises', 'view service connections', 'view meters',
            'view ra cases', 'triage ra cases', 'dispatch ra cases', 'resolve ra cases', 'close ra cases',
            'view ra rules', 'create ra rules', 'edit ra rules', 'run ra rules',
            'view interactions', 'create interactions',
        ]);

        $fieldOfficer = Role::firstOrCreate(['name' => 'Field Officer']);
        $fieldOfficer->givePermissionTo([
            'view customers', 'view premises', 'view meters',
            'record meter reads',
            'view ra cases', 'resolve ra cases',
            'view complaints', 'create complaints', 'resolve complaints',
            'view interactions', 'create interactions',
        ]);

        $billingClerk = Role::firstOrCreate(['name' => 'Billing Clerk']);
        $billingClerk->givePermissionTo([
            'view customers', 'view premises', 'view service connections',
            'view invoices', 'create invoices',
            'view payments', 'record payments',
            'import billing data', 'import mpesa data',
        ]);

        echo "CRM permissions and roles created successfully.\n";
    }
}
