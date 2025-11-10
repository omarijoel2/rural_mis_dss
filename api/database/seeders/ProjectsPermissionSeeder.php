<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class ProjectsPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Project Management
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',

            // Investment Planning
            'view investments',
            'create investments',
            'edit investments',
            'delete investments',
            'score investments',
            'appraise investments',
            'convert investments',

            // Land Administration
            'view land parcels',
            'create land parcels',
            'edit land parcels',
            'delete land parcels',

            // Wayleaves
            'create wayleaves',
            'edit wayleaves',
            'delete wayleaves',

            // Compensations
            'create compensations',
            'edit compensations',
            'delete compensations',

            // Disputes
            'create disputes',
            'edit disputes',
            'delete disputes',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->command->info('Module 9: Projects & Capital Planning permissions created successfully');
    }
}
