<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create the 5 ASAL (Arid and Semi-Arid Lands) county tenants
        $asalCounties = [
            [
                'short_code' => 'TWC',
                'name' => 'Turkana Water & Sanitation Company',
                'county' => 'Turkana',
            ],
            [
                'short_code' => 'WWC',
                'name' => 'Wajir Water & Sanitation Company',
                'county' => 'Wajir',
            ],
            [
                'short_code' => 'MWC',
                'name' => 'Marsabit Water & Sanitation Company',
                'county' => 'Marsabit',
            ],
            [
                'short_code' => 'MDC',
                'name' => 'Mandera Water & Sanitation Company',
                'county' => 'Mandera',
            ],
            [
                'short_code' => 'GWC',
                'name' => 'Garissa Water & Sanitation Company',
                'county' => 'Garissa',
            ],
        ];

        foreach ($asalCounties as $county) {
            Tenant::firstOrCreate(
                ['short_code' => $county['short_code']],
                [
                    'name' => $county['name'],
                    'county' => $county['county'],
                    'country' => 'KE',
                    'timezone' => 'Africa/Nairobi',
                    'currency' => 'KES',
                    'status' => 'active',
                ]
            );
            $this->command->info("Created tenant: {$county['name']} ({$county['county']} County)");
        }

        $this->call([
            ASALCountySeeders::class,
            UserSeeder::class,
            OperationsPermissionSeeder::class,
            OperationsSeeder::class,
            CostingPermissionSeeder::class,
            CostingSeeder::class,
        ]);

        $this->command->info('Database seeded successfully with 5 ASAL county data (Turkana, Wajir, Marsabit, Mandera, Garissa)');
    }
}
