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
        Tenant::firstOrCreate(
            ['short_code' => 'KWU'],
            [
                'name' => 'Kenya Water Utilities',
                'country' => 'KE',
                'timezone' => 'Africa/Nairobi',
                'currency' => 'KES',
                'status' => 'active',
            ]
        );

        $this->call([
            CoreRegistrySeeder::class,
        ]);

        $this->command->info('Database seeded successfully with Kenya spatial data');
    }
}
