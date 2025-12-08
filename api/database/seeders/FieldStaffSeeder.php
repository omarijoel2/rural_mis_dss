<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Organization;
use App\Models\Shift;
use App\Models\MeterRoute;
use App\Models\Scheme;
use App\Models\Dma;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class FieldStaffSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting Field Staff seeder...');

        $this->createRolesAndPermissions();
        $tenants = Tenant::all();
        
        if ($tenants->isEmpty()) {
            $this->command->warn('No tenants found. Run ASALCountySeeders first.');
            return;
        }

        foreach ($tenants as $tenant) {
            $this->seedFieldStaffForTenant($tenant);
        }

        $this->command->info('Field Staff seeder completed!');
        $this->command->info('');
        $this->command->info('=== Field Staff Credentials ===');
        $this->command->info('Supervisors: supervisor1@{county}.rwmis.go.ke / Supervisor@2025!');
        $this->command->info('Operators: operator1@{county}.rwmis.go.ke / Operator@2025!');
        $this->command->info('Technicians: technician1@{county}.rwmis.go.ke / Technician@2025!');
    }

    protected function createRolesAndPermissions(): void
    {
        $roles = [
            'Supervisor' => [
                'view work orders', 'create work orders', 'edit work orders', 'assign work orders',
                'view assets', 'edit assets', 'view cmms', 'manage shifts',
                'view schemes', 'view dmas', 'receive work orders'
            ],
            'Operator' => [
                'view work orders', 'view assets', 'view cmms',
                'view schemes', 'view dmas', 'receive work orders'
            ],
            'Technician' => [
                'view work orders', 'edit work orders', 'view assets', 'view cmms',
                'view schemes', 'view dmas', 'receive work orders'
            ],
            'Field Staff' => [
                'view work orders', 'view assets', 'view cmms',
                'view schemes', 'view dmas', 'receive work orders'
            ],
            'Maintenance Staff' => [
                'view work orders', 'edit work orders', 'view assets', 'view cmms',
                'view schemes', 'view dmas', 'receive work orders'
            ],
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            
            foreach ($permissions as $permName) {
                $permission = Permission::firstOrCreate(['name' => $permName, 'guard_name' => 'web']);
                if (!$role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                }
            }
        }

        $this->command->info('Roles and permissions created.');
    }

    protected function seedFieldStaffForTenant(Tenant $tenant): void
    {
        $countyPrefix = strtolower(explode(' ', $tenant->county)[0]);
        $scheme = Scheme::where('tenant_id', $tenant->id)->first();
        $dmas = Dma::where('tenant_id', $tenant->id)->get();

        $supervisors = $this->createSupervisors($tenant, $countyPrefix);
        $operators = $this->createOperators($tenant, $countyPrefix);
        $technicians = $this->createTechnicians($tenant, $countyPrefix);

        if ($scheme) {
            $this->createShifts($tenant, $scheme, $dmas, $supervisors);
            $this->createMeterRoutes($tenant, $scheme, $dmas, $operators);
        }

        $this->command->info("Created field staff for {$tenant->county}");
    }

    protected function createSupervisors(Tenant $tenant, string $countyPrefix): array
    {
        $supervisorRole = Role::where('name', 'Supervisor')->first();
        $supervisors = [];

        $supervisorData = [
            ['name' => 'John Mwangi', 'email' => "supervisor1@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'Mary Wanjiku', 'email' => "supervisor2@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'Peter Ochieng', 'email' => "supervisor3@{$countyPrefix}.rwmis.go.ke"],
        ];

        foreach ($supervisorData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('Supervisor@2025!'),
                    'email_verified_at' => now(),
                    'current_tenant_id' => $tenant->id,
                ]
            );

            $user->assignRole($supervisorRole);
            
            if (!$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
                $user->tenants()->attach($tenant->id, [
                    'id' => Str::uuid()->toString(),
                    'attrs' => json_encode(['access_level' => 'supervisor']),
                ]);
            }

            $supervisors[] = $user;
        }

        return $supervisors;
    }

    protected function createOperators(Tenant $tenant, string $countyPrefix): array
    {
        $operatorRole = Role::where('name', 'Operator')->first();
        $operators = [];

        $operatorData = [
            ['name' => 'James Kiprop', 'email' => "operator1@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'Grace Akinyi', 'email' => "operator2@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'David Kimani', 'email' => "operator3@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'Sarah Njeri', 'email' => "operator4@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'Michael Otieno', 'email' => "operator5@{$countyPrefix}.rwmis.go.ke"],
        ];

        foreach ($operatorData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('Operator@2025!'),
                    'email_verified_at' => now(),
                    'current_tenant_id' => $tenant->id,
                ]
            );

            $user->assignRole($operatorRole);
            
            if (!$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
                $user->tenants()->attach($tenant->id, [
                    'id' => Str::uuid()->toString(),
                    'attrs' => json_encode(['access_level' => 'operator']),
                ]);
            }

            $operators[] = $user;
        }

        return $operators;
    }

    protected function createTechnicians(Tenant $tenant, string $countyPrefix): array
    {
        $technicianRole = Role::where('name', 'Technician')->first();
        $technicians = [];

        $technicianData = [
            ['name' => 'Joseph Kamau', 'email' => "technician1@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'Elizabeth Wambui', 'email' => "technician2@{$countyPrefix}.rwmis.go.ke"],
            ['name' => 'Samuel Mutua', 'email' => "technician3@{$countyPrefix}.rwmis.go.ke"],
        ];

        foreach ($technicianData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('Technician@2025!'),
                    'email_verified_at' => now(),
                    'current_tenant_id' => $tenant->id,
                ]
            );

            $user->assignRole($technicianRole);
            
            if (!$user->tenants()->where('tenants.id', $tenant->id)->exists()) {
                $user->tenants()->attach($tenant->id, [
                    'id' => Str::uuid()->toString(),
                    'attrs' => json_encode(['access_level' => 'technician']),
                ]);
            }

            $technicians[] = $user;
        }

        return $technicians;
    }

    protected function createShifts(Tenant $tenant, Scheme $scheme, $dmas, array $supervisors): void
    {
        $now = Carbon::now();
        $dma = $dmas->first();
        
        $organization = Organization::where('name', 'like', "%{$tenant->county}%")->first();
        if (!$organization) {
            $this->command->warn("  - No organization found for {$tenant->county}, skipping shifts");
            return;
        }

        $shiftTemplates = [
            ['name' => 'Morning Shift', 'start_hour' => 6, 'end_hour' => 14],
            ['name' => 'Afternoon Shift', 'start_hour' => 14, 'end_hour' => 22],
            ['name' => 'Night Shift', 'start_hour' => 22, 'end_hour' => 6],
        ];

        foreach ($shiftTemplates as $index => $template) {
            $supervisor = $supervisors[$index % count($supervisors)];
            
            $startsAt = $now->copy()->setTime($template['start_hour'], 0);
            $endsAt = $now->copy()->setTime($template['end_hour'], 0);
            
            if ($template['end_hour'] < $template['start_hour']) {
                $endsAt->addDay();
            }

            Shift::firstOrCreate(
                [
                    'tenant_id' => $organization->id,
                    'name' => $template['name'],
                    'scheme_id' => $scheme->id,
                ],
                [
                    'tenant_id' => $organization->id,
                    'facility_id' => null,
                    'scheme_id' => $scheme->id,
                    'dma_id' => $dma?->id,
                    'name' => $template['name'],
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'supervisor_id' => $supervisor->id,
                    'status' => 'active',
                ]
            );
        }

        $this->command->info("  - Created 3 shifts with supervisors for {$tenant->county}");
    }

    protected function createMeterRoutes(Tenant $tenant, Scheme $scheme, $dmas, array $operators): void
    {
        $dma = $dmas->first();
        $countyPrefix = strtoupper(substr($tenant->county, 0, 3));
        
        $routeTemplates = [
            ['code' => "{$countyPrefix}-RT-001", 'name' => 'Central Zone Route', 'meters_count' => 150, 'read_day' => 1],
            ['code' => "{$countyPrefix}-RT-002", 'name' => 'North Zone Route', 'meters_count' => 120, 'read_day' => 5],
            ['code' => "{$countyPrefix}-RT-003", 'name' => 'South Zone Route', 'meters_count' => 180, 'read_day' => 10],
            ['code' => "{$countyPrefix}-RT-004", 'name' => 'East Zone Route', 'meters_count' => 100, 'read_day' => 15],
            ['code' => "{$countyPrefix}-RT-005", 'name' => 'West Zone Route', 'meters_count' => 130, 'read_day' => 20],
        ];

        foreach ($routeTemplates as $index => $template) {
            $operator = $operators[$index % count($operators)];
            
            MeterRoute::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'route_code' => $template['code'],
                ],
                [
                    'tenant_id' => $tenant->id,
                    'scheme_id' => $scheme->id,
                    'dma_id' => $dma?->id,
                    'route_code' => $template['code'],
                    'name' => $template['name'],
                    'meters_count' => $template['meters_count'],
                    'assigned_to' => $operator->id,
                    'status' => 'active',
                    'read_day' => $template['read_day'],
                ]
            );
        }

        $this->command->info("  - Created 5 meter routes with assigned operators for {$tenant->county}");
    }
}
