<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view schemes',
            'create schemes',
            'edit schemes',
            'delete schemes',
            
            'view facilities',
            'create facilities',
            'edit facilities',
            'delete facilities',
            
            'view organizations',
            'create organizations',
            'edit organizations',
            'delete organizations',
            
            'view dmas',
            'create dmas',
            'edit dmas',
            'delete dmas',
            
            'view pipelines',
            'create pipelines',
            'edit pipelines',
            'delete pipelines',
            
            'view zones',
            'create zones',
            'edit zones',
            'delete zones',
            
            'view audit',
            'export audit',
            
            'view security alerts',
            'acknowledge security alerts',
            'resolve security alerts',
            
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign roles',
            
            'view permissions',
            'grant permissions',
            'revoke permissions',
            
            'view dsr requests',
            'process dsr requests',
            'reject dsr requests',
            
            'view consents',
            'manage consents',
            
            'view kms keys',
            'generate kms keys',
            'rotate kms keys',
            
            'manage retention policies',
            'view data catalog',
            'edit data catalog',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $superAdmin = Role::create(['name' => 'Super Admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::create(['name' => 'Admin']);
        $admin->givePermissionTo([
            'view schemes', 'create schemes', 'edit schemes', 'delete schemes',
            'view facilities', 'create facilities', 'edit facilities', 'delete facilities',
            'view organizations', 'create organizations', 'edit organizations', 'delete organizations',
            'view dmas', 'create dmas', 'edit dmas', 'delete dmas',
            'view pipelines', 'create pipelines', 'edit pipelines', 'delete pipelines',
            'view zones', 'create zones', 'edit zones', 'delete zones',
            'view audit', 'export audit',
            'view security alerts', 'acknowledge security alerts', 'resolve security alerts',
            'view roles', 'assign roles',
            'view permissions',
            'view dsr requests', 'process dsr requests',
            'view consents', 'manage consents',
        ]);

        $manager = Role::create(['name' => 'Manager']);
        $manager->givePermissionTo([
            'view schemes', 'create schemes', 'edit schemes',
            'view facilities', 'create facilities', 'edit facilities',
            'view organizations', 'edit organizations',
            'view dmas', 'create dmas', 'edit dmas',
            'view pipelines', 'create pipelines', 'edit pipelines',
            'view zones', 'create zones', 'edit zones',
            'view audit',
            'view security alerts', 'acknowledge security alerts',
        ]);

        $operator = Role::create(['name' => 'Operator']);
        $operator->givePermissionTo([
            'view schemes',
            'view facilities',
            'view organizations',
            'view dmas',
            'view pipelines',
            'view zones',
        ]);

        $viewer = Role::create(['name' => 'Viewer']);
        $viewer->givePermissionTo([
            'view schemes',
            'view facilities',
            'view organizations',
            'view dmas',
            'view pipelines',
            'view zones',
        ]);

        $securityOfficer = Role::create(['name' => 'Security Officer']);
        $securityOfficer->givePermissionTo([
            'view audit', 'export audit',
            'view security alerts', 'acknowledge security alerts', 'resolve security alerts',
            'view roles', 'view permissions',
            'view dsr requests', 'process dsr requests', 'reject dsr requests',
            'view consents', 'manage consents',
            'view kms keys', 'generate kms keys', 'rotate kms keys',
            'manage retention policies',
            'view data catalog', 'edit data catalog',
        ]);

        $privacyOfficer = Role::create(['name' => 'Privacy Officer']);
        $privacyOfficer->givePermissionTo([
            'view audit', 'export audit',
            'view dsr requests', 'process dsr requests', 'reject dsr requests',
            'view consents', 'manage consents',
            'manage retention policies',
            'view data catalog', 'edit data catalog',
        ]);

        \Log::info('Roles and permissions seeded successfully');
    }
}
