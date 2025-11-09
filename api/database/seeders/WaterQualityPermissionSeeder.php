<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class WaterQualityPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating Water Quality module permissions...');

        $wqPermissions = [
            // Parameter permissions (4)
            'view wq parameters',
            'create wq parameters',
            'edit wq parameters',
            'delete wq parameters',
            
            // Sampling Point permissions (4)
            'view wq sampling points',
            'create wq sampling points',
            'edit wq sampling points',
            'delete wq sampling points',
            
            // Plan permissions (6)
            'view wq plans',
            'create wq plans',
            'edit wq plans',
            'delete wq plans',
            'activate wq plans',
            'generate wq sampling tasks',
            
            // Sample permissions (6)
            'view wq samples',
            'create wq samples',
            'edit wq samples',
            'delete wq samples',
            'collect wq samples',
            'receive wq samples',
            
            // Result permissions (6)
            'view wq results',
            'create wq results',
            'edit wq results',
            'delete wq results',
            'import wq results',
            'export wq results',
            
            // QC Control permissions (4)
            'view wq qc controls',
            'create wq qc controls',
            'edit wq qc controls',
            'delete wq qc controls',
            
            // Compliance permissions (3)
            'view wq compliance',
            'export wq compliance reports',
            'compute wq compliance',
        ];

        foreach ($wqPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $this->command->info('Assigning Water Quality permissions to roles...');

        $superAdmin = Role::where('name', 'Super Admin')->first();
        $admin = Role::where('name', 'Admin')->first();
        $manager = Role::where('name', 'Manager')->first();
        $operator = Role::where('name', 'Operator')->first();
        $viewer = Role::where('name', 'Viewer')->first();

        // Super Admin: All permissions
        if ($superAdmin) {
            $superAdmin->givePermissionTo($wqPermissions);
        }

        // Admin: All permissions
        if ($admin) {
            $admin->givePermissionTo($wqPermissions);
        }

        // Manager: All except delete
        if ($manager) {
            $manager->givePermissionTo([
                'view wq parameters',
                'create wq parameters',
                'edit wq parameters',
                'view wq sampling points',
                'create wq sampling points',
                'edit wq sampling points',
                'view wq plans',
                'create wq plans',
                'edit wq plans',
                'activate wq plans',
                'generate wq sampling tasks',
                'view wq samples',
                'create wq samples',
                'edit wq samples',
                'collect wq samples',
                'receive wq samples',
                'view wq results',
                'create wq results',
                'edit wq results',
                'import wq results',
                'export wq results',
                'view wq qc controls',
                'create wq qc controls',
                'edit wq qc controls',
                'view wq compliance',
                'export wq compliance reports',
                'compute wq compliance',
            ]);
        }

        // Operator: Field sampling + basic data entry
        if ($operator) {
            $operator->givePermissionTo([
                'view wq parameters',
                'view wq sampling points',
                'view wq plans',
                'view wq samples',
                'create wq samples',
                'edit wq samples',
                'collect wq samples',
                'receive wq samples',
                'view wq results',
                'create wq results',
                'edit wq results',
                'import wq results',
                'view wq qc controls',
                'view wq compliance',
            ]);
        }

        // Viewer: Read-only access
        if ($viewer) {
            $viewer->givePermissionTo([
                'view wq parameters',
                'view wq sampling points',
                'view wq plans',
                'view wq samples',
                'view wq results',
                'view wq qc controls',
                'view wq compliance',
            ]);
        }

        // Create specialized WQ roles
        $this->command->info('Creating specialized Water Quality roles...');

        $labAnalyst = Role::firstOrCreate(['name' => 'Lab Analyst', 'guard_name' => 'web']);
        $labAnalyst->givePermissionTo([
            'view wq parameters',
            'view wq samples',
            'receive wq samples',
            'view wq results',
            'create wq results',
            'edit wq results',
            'import wq results',
            'export wq results',
            'view wq qc controls',
            'create wq qc controls',
            'edit wq qc controls',
            'view wq compliance',
        ]);

        $sampler = Role::firstOrCreate(['name' => 'Field Sampler', 'guard_name' => 'web']);
        $sampler->givePermissionTo([
            'view wq parameters',
            'view wq sampling points',
            'view wq plans',
            'view wq samples',
            'create wq samples',
            'collect wq samples',
        ]);

        $qcOfficer = Role::firstOrCreate(['name' => 'QA/QC Officer', 'guard_name' => 'web']);
        $qcOfficer->givePermissionTo([
            'view wq parameters',
            'edit wq parameters',
            'view wq sampling points',
            'view wq plans',
            'view wq samples',
            'view wq results',
            'edit wq results',
            'view wq qc controls',
            'create wq qc controls',
            'edit wq qc controls',
            'delete wq qc controls',
            'view wq compliance',
            'compute wq compliance',
            'export wq compliance reports',
        ]);

        $this->command->info('Water Quality permissions (33 total) created and assigned successfully!');
    }
}
