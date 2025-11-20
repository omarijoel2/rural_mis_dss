<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CoreOpsPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating Core Operations module permissions...');

        // Permissions aligned with actual route middleware
        $coreOpsPermissions = [
            // Network Topology
            'view network topology',
            'edit network topology',
            
            // Telemetry & SCADA
            'view telemetry',
            'manage telemetry',
            'ingest telemetry',
            
            // NRW
            'view nrw',
            'manage nrw',
            
            // Outage Management
            'view outages',
            'manage outages',
            'delete outages',
            
            // Dosing Control
            'view dosing',
            'manage dosing',
            
            // Pump Scheduling
            'view pump schedules',
            'manage pump schedules',
            
            // Operations Dashboard
            'view operations dashboard',
        ];

        foreach ($coreOpsPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $this->command->info('Assigning Core Operations permissions to roles...');

        $superAdmin = Role::where('name', 'Super Admin')->first();
        $admin = Role::where('name', 'Admin')->first();
        $manager = Role::where('name', 'Manager')->first();
        $operator = Role::where('name', 'Operator')->first();
        $viewer = Role::where('name', 'Viewer')->first();

        // Super Admin gets all permissions
        if ($superAdmin) {
            $superAdmin->givePermissionTo($coreOpsPermissions);
        }

        // Admin gets all permissions except delete
        if ($admin) {
            $admin->givePermissionTo(array_filter($coreOpsPermissions, function($perm) {
                return !str_contains($perm, 'delete');
            }));
        }

        // Manager gets all operational permissions except delete
        if ($manager) {
            $manager->givePermissionTo([
                'view network topology',
                'edit network topology',
                'view telemetry',
                'manage telemetry',
                'ingest telemetry',
                'view nrw',
                'manage nrw',
                'view outages',
                'manage outages',
                'view dosing',
                'manage dosing',
                'view pump schedules',
                'manage pump schedules',
                'view operations dashboard',
            ]);
        }

        // Operator gets operational permissions (can ingest data, view only)
        if ($operator) {
            $operator->givePermissionTo([
                'view network topology',
                'view telemetry',
                'ingest telemetry',
                'view nrw',
                'view outages',
                'view dosing',
                'view pump schedules',
                'view operations dashboard',
            ]);
        }

        // Viewer gets read-only permissions
        if ($viewer) {
            $viewer->givePermissionTo([
                'view network topology',
                'view telemetry',
                'view nrw',
                'view outages',
                'view dosing',
                'view pump schedules',
                'view operations dashboard',
            ]);
        }

        $this->command->info('Core Operations permissions created and assigned successfully.');
    }
}
