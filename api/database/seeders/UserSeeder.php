<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tenant;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed users for the 5 ASAL counties.
     * - 1 Super Admin (can access all counties)
     * - 5 County Admins (one per county)
     */
    public function run(): void
    {
        // Ensure roles exist
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        
        // Get all tenants
        $tenants = Tenant::all();
        
        if ($tenants->isEmpty()) {
            $this->command->warn('No tenants found. Run ASALCountySeeders first.');
            return;
        }

        // Create Super Admin (can access all counties)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@rwmis.go.ke'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('SuperAdmin@2025!'),
                'email_verified_at' => now(),
                'current_tenant_id' => $tenants->first()->id,
            ]
        );
        $superAdmin->assignRole($superAdminRole);
        $this->command->info("Created Super Admin: superadmin@rwmis.go.ke");

        // Create County Admins (one per county)
        $countyAdmins = [
            'TWC' => ['email' => 'admin@turkana.rwmis.go.ke', 'name' => 'Turkana County Admin'],
            'WWC' => ['email' => 'admin@wajir.rwmis.go.ke', 'name' => 'Wajir County Admin'],
            'MWC' => ['email' => 'admin@marsabit.rwmis.go.ke', 'name' => 'Marsabit County Admin'],
            'MDC' => ['email' => 'admin@mandera.rwmis.go.ke', 'name' => 'Mandera County Admin'],
            'GWC' => ['email' => 'admin@garissa.rwmis.go.ke', 'name' => 'Garissa County Admin'],
        ];

        foreach ($countyAdmins as $shortCode => $adminData) {
            $tenant = $tenants->where('short_code', $shortCode)->first();
            
            if (!$tenant) {
                $this->command->warn("Tenant {$shortCode} not found. Skipping.");
                continue;
            }

            $user = User::firstOrCreate(
                ['email' => $adminData['email']],
                [
                    'name' => $adminData['name'],
                    'password' => Hash::make('CountyAdmin@2025!'),
                    'email_verified_at' => now(),
                    'current_tenant_id' => $tenant->id,
                ]
            );
            
            // Assign Admin role
            $user->assignRole($adminRole);
            
            // Assign user to their specific tenant via pivot table
            if (!$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
                $user->tenants()->attach($tenant->id, [
                    'id' => \Illuminate\Support\Str::uuid()->toString(),
                    'attrs' => json_encode(['access_level' => 'admin']),
                ]);
            }
            
            $this->command->info("Created County Admin for {$tenant->county}: {$adminData['email']}");
        }

        $this->command->info('');
        $this->command->info('=== Login Credentials ===');
        $this->command->info('Super Admin: superadmin@rwmis.go.ke / SuperAdmin@2025!');
        $this->command->info('County Admins: admin@{county}.rwmis.go.ke / CountyAdmin@2025!');
        $this->command->info('');
    }
}
