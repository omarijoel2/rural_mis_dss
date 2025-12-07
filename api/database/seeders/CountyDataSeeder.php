<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CountyDataSeeder extends Seeder
{
    protected array $counties = [
        'Turkana' => [
            'tenant_id' => 'a082a1ea-1a12-4168-af68-841498a137f9',
            'org_id' => 'a082a1ef-ac0d-4fd1-a50c-91e2c410a9d4',
            'zones' => ['Lodwar Central', 'Lodwar East', 'Kakuma', 'Lokichogio', 'Kalokol', 'Turkwel'],
            'towns' => ['Lodwar', 'Kakuma', 'Lokichogio', 'Kalokol'],
        ],
        'Wajir' => [
            'tenant_id' => 'a082a1eb-23f7-4354-8829-cbe19eac1214',
            'org_id' => 'a082a1f7-bf28-472b-a22e-d1a6a1111766',
            'zones' => ['Wajir Town', 'Habaswein', 'Bute', 'Griftu', 'Tarbaj', 'Eldas'],
            'towns' => ['Wajir', 'Habaswein', 'Bute', 'Griftu'],
        ],
        'Marsabit' => [
            'tenant_id' => 'a082a1ec-2501-4642-a5ae-9fa7bf612a33',
            'org_id' => 'a082a1fe-cb18-4ce1-8df6-e64ec79b6547',
            'zones' => ['Marsabit Central', 'Moyale', 'North Horr', 'Laisamis', 'Saku', 'Chalbi'],
            'towns' => ['Marsabit', 'Moyale', 'North Horr', 'Laisamis'],
        ],
        'Mandera' => [
            'tenant_id' => 'a082a1ed-2612-43a8-86ba-c728e7d9e36b',
            'org_id' => 'a082a206-d098-4f19-aaad-87d59aea1a12',
            'zones' => ['Mandera Town', 'Elwak', 'Takaba', 'Banissa', 'Lafey', 'Rhamu'],
            'towns' => ['Mandera', 'Elwak', 'Takaba', 'Banissa'],
        ],
        'Garissa' => [
            'tenant_id' => 'a082a1ee-26fa-46da-a094-a3b289241c0b',
            'org_id' => 'a082a20e-d671-4720-b973-b01a3466f00e',
            'zones' => ['Garissa Township', 'Dadaab', 'Fafi', 'Ijara', 'Lagdera', 'Balambala'],
            'towns' => ['Garissa', 'Dadaab', 'Modogashe', 'Masalani'],
        ],
    ];

    public function run(): void
    {
        foreach ($this->counties as $countyName => $county) {
            $this->command->info("Seeding data for {$countyName}...");
            
            if (\Schema::hasTable('zones')) {
                $this->seedZones($countyName, $county);
            }
            
            if (\Schema::hasTable('water_sources')) {
                $this->seedWaterSources($countyName, $county);
            }
            
            if (\Schema::hasTable('assets')) {
                $this->seedAssets($countyName, $county);
            }
            
            if (\Schema::hasTable('crm_water_trucks')) {
                $this->seedWaterTrucks($countyName, $county);
            }
            
            if (\Schema::hasTable('truck_trips')) {
                $this->seedTruckTrips($countyName, $county);
            }
            
            if (\Schema::hasTable('customers')) {
                $this->seedCustomers($countyName, $county);
            }
            
            if (\Schema::hasTable('kiosks')) {
                $this->seedKiosks($countyName, $county);
            }
        }

        $this->command->info('County data seeded successfully for all 5 ASAL counties!');
    }

    protected function seedZones(string $countyName, array $county): void
    {
        $prefix = strtoupper(substr($countyName, 0, 3));
        
        foreach ($county['zones'] as $i => $zoneName) {
            $code = "{$prefix}-Z" . str_pad($i + 1, 2, '0', STR_PAD_LEFT);
            
            $exists = DB::table('zones')
                ->where('tenant_id', $county['tenant_id'])
                ->where('code', $code)
                ->exists();

            if (!$exists) {
                DB::table('zones')->insert([
                    'id' => Str::uuid()->toString(),
                    'tenant_id' => $county['tenant_id'],
                    'code' => $code,
                    'name' => $zoneName,
                    'type' => $i < 2 ? 'sub_county' : 'dma',
                    'meta' => json_encode(['population' => rand(15000, 80000), 'households' => rand(3000, 15000)]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    protected function seedWaterSources(string $countyName, array $county): void
    {
        $prefix = strtoupper(substr($countyName, 0, 3));
        $sourceTypes = ['borehole', 'spring', 'river_intake', 'dam', 'shallow_well'];
        
        foreach ($county['towns'] as $i => $town) {
            $sourceType = $sourceTypes[$i % count($sourceTypes)];
            $code = "{$prefix}-WS-" . str_pad($i + 1, 3, '0', STR_PAD_LEFT);
            
            $exists = DB::table('water_sources')
                ->where('tenant_id', $county['tenant_id'])
                ->where('source_code', $code)
                ->exists();

            if (!$exists) {
                DB::table('water_sources')->insert([
                    'id' => Str::uuid()->toString(),
                    'tenant_id' => $county['tenant_id'],
                    'source_code' => $code,
                    'name' => "{$town} {$this->formatSourceType($sourceType)}",
                    'source_type' => $sourceType,
                    'yield_m3_day' => rand(50, 500),
                    'depth_m' => $sourceType === 'borehole' ? rand(80, 200) : null,
                    'water_quality_class' => ['A', 'B', 'C'][rand(0, 2)],
                    'status' => 'active',
                    'latitude' => rand(-4, 4) + (rand(0, 99) / 100),
                    'longitude' => rand(35, 41) + (rand(0, 99) / 100),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    protected function seedAssets(string $countyName, array $county): void
    {
        $prefix = strtoupper(substr($countyName, 0, 3));
        $assetTypes = [
            ['prefix' => 'PMP', 'class_id' => 1],
            ['prefix' => 'RES', 'class_id' => 5],
            ['prefix' => 'MTR', 'class_id' => 4],
            ['prefix' => 'VAL', 'class_id' => 2],
        ];

        $idx = 1;
        foreach ($county['towns'] as $town) {
            foreach ($assetTypes as $assetType) {
                $code = "{$assetType['prefix']}-{$prefix}-" . str_pad($idx, 3, '0', STR_PAD_LEFT);
                
                $exists = DB::table('assets')
                    ->where('tenant_id', $county['org_id'])
                    ->where('code', $code)
                    ->exists();

                if (!$exists) {
                    DB::table('assets')->insert([
                        'tenant_id' => $county['org_id'],
                        'class_id' => $assetType['class_id'],
                        'code' => $code,
                        'name' => "{$town} {$this->formatAssetType($assetType['prefix'])}",
                        'manufacturer' => ['Grundfos', 'KSB', 'Wilo', 'Ebara'][rand(0, 3)],
                        'status' => ['active', 'active', 'active', 'under_maintenance'][rand(0, 3)],
                        'install_date' => now()->subYears(rand(1, 10))->toDateString(),
                        'specs' => json_encode(['capacity' => rand(100, 1000), 'location' => $town]),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                $idx++;
            }
        }
    }

    protected function seedWaterTrucks(string $countyName, array $county): void
    {
        $prefix = strtoupper(substr($countyName, 0, 3));
        $drivers = [
            ['name' => 'John Ekiru', 'phone' => '+254712345001'],
            ['name' => 'Mohammed Ali', 'phone' => '+254712345002'],
            ['name' => 'Peter Lokori', 'phone' => '+254712345003'],
            ['name' => 'Ibrahim Hassan', 'phone' => '+254712345004'],
        ];

        foreach ($drivers as $i => $driver) {
            $truckNo = "K{$prefix} " . str_pad(100 + $i, 3, '0', STR_PAD_LEFT) . chr(65 + $i);
            
            $exists = DB::table('crm_water_trucks')
                ->where('tenant_id', $county['org_id'])
                ->where('truck_no', $truckNo)
                ->exists();

            if (!$exists) {
                DB::table('crm_water_trucks')->insert([
                    'tenant_id' => $county['org_id'],
                    'truck_no' => $truckNo,
                    'driver_name' => $driver['name'],
                    'phone' => $driver['phone'],
                    'capacity' => [5000, 8000, 10000, 12000][$i],
                    'status' => ['available', 'in_transit', 'available', 'maintenance'][$i],
                    'trips_today' => rand(0, 5),
                    'revenue_today' => rand(5000, 25000),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    protected function seedTruckTrips(string $countyName, array $county): void
    {
        $trucks = DB::table('crm_water_trucks')
            ->where('tenant_id', $county['org_id'])
            ->pluck('truck_no')
            ->toArray();

        if (empty($trucks)) return;

        $existingCount = DB::table('truck_trips')
            ->where('tenant_id', $county['tenant_id'])
            ->count();

        if ($existingCount >= 5) return;

        $destinations = $county['zones'];
        $prefix = strtoupper(substr($countyName, 0, 3));

        for ($i = 0; $i < 6; $i++) {
            $tripCode = "TRP-{$prefix}-" . date('Y') . '-' . str_pad($existingCount + $i + 1, 4, '0', STR_PAD_LEFT);
            $volume = rand(3, 12);
            $pricePerM3 = rand(800, 1500);

            DB::table('truck_trips')->insert([
                'id' => Str::uuid()->toString(),
                'tenant_id' => $county['tenant_id'],
                'trip_code' => $tripCode,
                'truck_registration' => $trucks[array_rand($trucks)],
                'driver_name' => ['John Ekiru', 'Mohammed Ali', 'Peter Lokori', 'Ibrahim Hassan'][rand(0, 3)],
                'driver_phone' => '+2547' . rand(10000000, 99999999),
                'volume_m3' => $volume,
                'price_per_m3' => $pricePerM3,
                'total_amount' => $volume * $pricePerM3,
                'source_location' => "{$county['towns'][0]} Water Point",
                'delivery_location' => $destinations[array_rand($destinations)],
                'departure_time' => now()->subHours(rand(1, 72)),
                'arrival_time' => rand(0, 1) ? now()->subHours(rand(0, 48)) : null,
                'status' => ['scheduled', 'in_transit', 'delivered', 'verified'][rand(0, 3)],
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    protected function seedCustomers(string $countyName, array $county): void
    {
        $prefix = strtoupper(substr($countyName, 0, 3));
        $customerTypes = ['residential', 'commercial', 'institutional', 'industrial'];

        $existingCount = DB::table('customers')
            ->where('tenant_id', $county['tenant_id'])
            ->count();

        if ($existingCount >= 10) return;

        for ($i = 0; $i < 15; $i++) {
            $customerType = $customerTypes[$i % count($customerTypes)];
            $accountNo = "{$prefix}-" . str_pad($existingCount + $i + 1, 6, '0', STR_PAD_LEFT);
            
            $name = $customerType === 'residential' 
                ? $this->generatePersonName() 
                : $this->generateBusinessName($customerType, $county['towns'][rand(0, count($county['towns']) - 1)]);

            DB::table('customers')->insert([
                'id' => Str::uuid()->toString(),
                'tenant_id' => $county['tenant_id'],
                'account_no' => $accountNo,
                'name' => $name,
                'customer_type' => $customerType,
                'phone' => '+2547' . rand(10000000, 99999999),
                'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com',
                'address' => $county['towns'][rand(0, count($county['towns']) - 1)] . ', ' . $countyName . ' County',
                'status' => ['active', 'active', 'active', 'inactive'][rand(0, 3)],
                'meter_no' => "MTR-{$prefix}-" . str_pad(rand(1000, 9999), 5, '0', STR_PAD_LEFT),
                'balance' => rand(-5000, 50000),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    protected function seedKiosks(string $countyName, array $county): void
    {
        $prefix = strtoupper(substr($countyName, 0, 3));

        $existingCount = DB::table('kiosks')
            ->where('tenant_id', $county['tenant_id'])
            ->count();

        if ($existingCount >= 4) return;

        foreach ($county['towns'] as $i => $town) {
            $kioskCode = "KSK-{$prefix}-" . str_pad($existingCount + $i + 1, 3, '0', STR_PAD_LEFT);

            $lat = 2.5 + ($i * 0.1) + (rand(0, 100) / 1000);
            $lon = 36.0 + ($i * 0.1) + (rand(0, 100) / 1000);
            
            DB::table('kiosks')->insert([
                'id' => Str::uuid()->toString(),
                'tenant_id' => $county['tenant_id'],
                'kiosk_code' => $kioskCode,
                'name' => "{$town} Public Kiosk",
                'location' => DB::raw("ST_SetSRID(ST_MakePoint({$lon}, {$lat}), 4326)"),
                'vendor_name' => $this->generatePersonName(),
                'vendor_phone' => '+2547' . rand(10000000, 99999999),
                'daily_sales_m3' => rand(2, 20),
                'balance' => rand(0, 50000),
                'status' => ['active', 'active', 'inactive'][rand(0, 2)],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    protected function formatSourceType(string $type): string
    {
        return match ($type) {
            'borehole' => 'Borehole',
            'spring' => 'Natural Spring',
            'river_intake' => 'River Intake',
            'dam' => 'Dam',
            'shallow_well' => 'Shallow Well',
            default => ucfirst($type),
        };
    }

    protected function formatAssetType(string $prefix): string
    {
        return match ($prefix) {
            'PMP' => 'Pump Station',
            'RES' => 'Storage Tank',
            'MTR' => 'Master Meter',
            'VAL' => 'Main Valve',
            default => 'Asset',
        };
    }

    protected function generatePersonName(): string
    {
        $firstNames = ['John', 'Mary', 'Peter', 'Sarah', 'James', 'Grace', 'Mohammed', 'Fatima', 'Ibrahim', 'Amina'];
        $lastNames = ['Ekiru', 'Lokori', 'Hassan', 'Ali', 'Omar', 'Mwangi', 'Wanjiku', 'Korir', 'Chebet', 'Muthoni'];
        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }

    protected function generateBusinessName(string $type, string $town): string
    {
        return match ($type) {
            'commercial' => "{$town} " . ['Traders', 'Hotel', 'Guest House', 'Restaurant', 'Market'][rand(0, 4)],
            'institutional' => "{$town} " . ['Primary School', 'Secondary School', 'Health Center', 'County Office', 'Police Station'][rand(0, 4)],
            'industrial' => "{$town} " . ['Slaughterhouse', 'Processing Plant', 'Factory', 'Workshop'][rand(0, 3)],
            default => "{$town} Enterprise",
        };
    }
}
