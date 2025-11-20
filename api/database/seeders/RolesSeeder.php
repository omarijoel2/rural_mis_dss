<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating base roles...');

        $roles = [
            'Super Admin',
            'Admin',
            'Manager',
            'Operator',
            'Viewer',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(
                ['name' => $roleName],
                ['guard_name' => 'web']
            );
            $this->command->info("Created role: {$roleName}");
        }

        $this->command->info('Base roles created successfully.');
    }
}
