<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class OperationsPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating Operations module permissions...');

        $operationsPermissions = [
            // Event permissions (8)
            'view events',
            'create events',
            'ingest events',
            'acknowledge events',
            'resolve events',
            'escalate events',
            'edit events',
            'delete events',
            
            // Shift permissions (6)
            'view shifts',
            'create shifts',
            'edit shifts',
            'close shifts',
            'view handover reports',
            'create handover reports',
            
            // Playbook permissions (6)
            'view playbooks',
            'create playbooks',
            'edit playbooks',
            'delete playbooks',
            'approve playbooks',
            'execute playbooks',
            
            // Checklist permissions (5)
            'view checklists',
            'create checklists',
            'edit checklists',
            'delete checklists',
            'run checklists',
            
            // Escalation Policy permissions (2)
            'view escalation policies',
            'manage escalation policies',
            
            // Notification permissions (2)
            'view notifications',
            'manage notifications',
        ];

        foreach ($operationsPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $this->command->info('Assigning Operations permissions to roles...');

        $superAdmin = Role::where('name', 'Super Admin')->first();
        $admin = Role::where('name', 'Admin')->first();
        $manager = Role::where('name', 'Manager')->first();
        $operator = Role::where('name', 'Operator')->first();
        $viewer = Role::where('name', 'Viewer')->first();

        if ($superAdmin) {
            $superAdmin->givePermissionTo($operationsPermissions);
        }

        if ($admin) {
            $admin->givePermissionTo($operationsPermissions);
        }

        if ($manager) {
            $manager->givePermissionTo([
                'view events',
                'create events',
                'acknowledge events',
                'resolve events',
                'escalate events',
                'edit events',
                'view shifts',
                'create shifts',
                'edit shifts',
                'close shifts',
                'view handover reports',
                'create handover reports',
                'view playbooks',
                'create playbooks',
                'edit playbooks',
                'execute playbooks',
                'view checklists',
                'create checklists',
                'edit checklists',
                'run checklists',
                'view escalation policies',
                'view notifications',
                'manage notifications',
            ]);
        }

        if ($operator) {
            $operator->givePermissionTo([
                'view events',
                'create events',
                'acknowledge events',
                'view shifts',
                'edit shifts',
                'create handover reports',
                'view handover reports',
                'view playbooks',
                'execute playbooks',
                'view checklists',
                'run checklists',
                'view escalation policies',
                'view notifications',
            ]);
        }

        if ($viewer) {
            $viewer->givePermissionTo([
                'view events',
                'view shifts',
                'view handover reports',
                'view playbooks',
                'view checklists',
                'view escalation policies',
                'view notifications',
            ]);
        }

        $this->command->info('Creating System/Service role for automated operations...');
        
        $systemRole = Role::firstOrCreate(['name' => 'System', 'guard_name' => 'web']);
        $systemRole->givePermissionTo([
            'ingest events',
            'escalate events',
            'execute playbooks',
        ]);

        $this->command->info('Operations permissions (29 total) created and assigned successfully!');
    }
}

