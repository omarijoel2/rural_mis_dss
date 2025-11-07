<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $cmmsPermissions = [
            'view assets',
            'create assets',
            'edit assets',
            'delete assets',
            'view work orders',
            'create work orders',
            'edit work orders',
            'delete work orders',
            'view inventory',
            'create inventory',
            'edit inventory',
            'delete inventory',
            'approve work orders',
            'close work orders',
        ];

        foreach ($cmmsPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin = Role::where('name', 'Super Admin')->first();
        $admin = Role::where('name', 'Admin')->first();
        $manager = Role::where('name', 'Manager')->first();
        $operator = Role::where('name', 'Operator')->first();
        $viewer = Role::where('name', 'Viewer')->first();

        if ($superAdmin) {
            $superAdmin->givePermissionTo($cmmsPermissions);
        }

        if ($admin) {
            $admin->givePermissionTo($cmmsPermissions);
        }

        if ($manager) {
            $manager->givePermissionTo([
                'view assets',
                'create assets',
                'edit assets',
                'view work orders',
                'create work orders',
                'edit work orders',
                'view inventory',
                'edit inventory',
                'approve work orders',
                'close work orders',
            ]);
        }

        if ($operator) {
            $operator->givePermissionTo([
                'view assets',
                'view work orders',
                'edit work orders',
                'view inventory',
            ]);
        }

        if ($viewer) {
            $viewer->givePermissionTo([
                'view assets',
                'view work orders',
                'view inventory',
            ]);
        }

        $this->command->info('CMMS permissions created and assigned to roles successfully.');
    }
}
