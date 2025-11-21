<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CrmTariff;
use App\Models\CrmMeterRoute;
use App\Models\CrmConnectionApplication;
use App\Models\CrmKiosk;
use App\Models\CrmWaterTruck;
use Illuminate\Support\Facades\DB;

class CommercialModuleSeeder extends Seeder
{
    public function run(): void
    {
        // Get first tenant for seeding
        $tenantId = DB::table('organizations')->first()->id ?? null;
        
        if (!$tenantId) {
            $this->command->error('No organization found. Please create an organization first.');
            return;
        }

        $this->command->info('Seeding Commercial Module data for tenant: ' . $tenantId);

        // Seed Tariffs
        $this->command->info('Seeding tariffs...');
        CrmTariff::create([
            'tenant_id' => $tenantId,
            'name' => 'Residential Tariff 2024',
            'valid_from' => now()->subMonths(6)->format('Y-m-d'),
            'valid_to' => now()->addMonths(6)->format('Y-m-d'),
            'blocks' => [
                ['min' => 0, 'max' => 10, 'rate' => 50, 'lifeline' => true],
                ['min' => 10, 'max' => 20, 'rate' => 75, 'lifeline' => false],
                ['min' => 20, 'max' => null, 'rate' => 100, 'lifeline' => false],
            ],
            'fixed_charge' => 200,
            'currency' => 'KES',
        ]);

        CrmTariff::create([
            'tenant_id' => $tenantId,
            'name' => 'Commercial Tariff 2024',
            'valid_from' => now()->subMonths(6)->format('Y-m-d'),
            'valid_to' => now()->addMonths(6)->format('Y-m-d'),
            'blocks' => [
                ['min' => 0, 'max' => 50, 'rate' => 80, 'lifeline' => false],
                ['min' => 50, 'max' => null, 'rate' => 120, 'lifeline' => false],
            ],
            'fixed_charge' => 500,
            'currency' => 'KES',
        ]);

        // Seed Meter Routes
        $this->command->info('Seeding meter routes...');
        CrmMeterRoute::create([
            'tenant_id' => $tenantId,
            'route_code' => 'RT-001',
            'area' => 'Central Zone A',
            'assigned_to' => 'John Mwangi',
            'meters_count' => 245,
            'status' => 'active',
            'last_read_date' => now()->subDays(5),
            'completion_rate' => 98.4,
        ]);

        CrmMeterRoute::create([
            'tenant_id' => $tenantId,
            'route_code' => 'RT-002',
            'area' => 'Eastern Zone B',
            'assigned_to' => 'Mary Wanjiru',
            'meters_count' => 189,
            'status' => 'active',
            'last_read_date' => now()->subDays(3),
            'completion_rate' => 100.0,
        ]);

        CrmMeterRoute::create([
            'tenant_id' => $tenantId,
            'route_code' => 'RT-003',
            'area' => 'Western Zone C',
            'assigned_to' => null,
            'meters_count' => 156,
            'status' => 'unassigned',
            'last_read_date' => null,
            'completion_rate' => 0,
        ]);

        // Seed Connection Applications
        $this->command->info('Seeding connection applications...');
        CrmConnectionApplication::create([
            'tenant_id' => $tenantId,
            'application_no' => 'APP-2024-001',
            'applicant_name' => 'Jane Doe',
            'phone' => '+254712345678',
            'email' => 'jane@example.com',
            'id_number' => 'ID-12345678',
            'address' => 'Plot 123, Nairobi Road',
            'location' => ['lat' => -1.286389, 'lng' => 36.817223],
            'connection_type' => 'new',
            'property_type' => 'residential',
            'status' => 'pending_approval',
            'kyc_status' => 'verified',
            'estimated_cost' => 25000,
            'applied_date' => now()->subDays(5),
        ]);

        CrmConnectionApplication::create([
            'tenant_id' => $tenantId,
            'application_no' => 'APP-2024-002',
            'applicant_name' => 'John Smith',
            'phone' => '+254723456789',
            'address' => 'Plot 456, Kenyatta Avenue',
            'location' => ['lat' => -1.289505, 'lng' => 36.750326],
            'connection_type' => 'new',
            'property_type' => 'commercial',
            'status' => 'approved',
            'kyc_status' => 'verified',
            'estimated_cost' => 40000,
            'applied_date' => now()->subDays(10),
            'approved_date' => now()->subDays(3),
        ]);

        // Seed Kiosks
        $this->command->info('Seeding kiosks...');
        CrmKiosk::create([
            'tenant_id' => $tenantId,
            'kiosk_code' => 'KSK-001',
            'vendor_name' => 'Mama Watamu Kiosk',
            'vendor_phone' => '+254712345678',
            'location' => 'Kawangware, Zone A',
            'coordinates' => ['lat' => -1.289505, 'lng' => 36.750326],
            'daily_target' => 50000,
            'today_sales' => 42500,
            'balance' => 125000,
            'status' => 'active',
        ]);

        CrmKiosk::create([
            'tenant_id' => $tenantId,
            'kiosk_code' => 'KSK-002',
            'vendor_name' => 'Baba Njeri Water Point',
            'vendor_phone' => '+254723456789',
            'location' => 'Kibera, Olympic',
            'coordinates' => ['lat' => -1.313321, 'lng' => 36.787598],
            'daily_target' => 35000,
            'today_sales' => 38200,
            'balance' => 89000,
            'status' => 'active',
        ]);

        // Seed Water Trucks
        $this->command->info('Seeding water trucks...');
        CrmWaterTruck::create([
            'tenant_id' => $tenantId,
            'truck_no' => 'TRK-001',
            'driver_name' => 'James Omondi',
            'phone' => '+254745678901',
            'capacity' => 10000,
            'status' => 'in_transit',
            'trips_today' => 2,
            'revenue_today' => 50000,
        ]);

        CrmWaterTruck::create([
            'tenant_id' => $tenantId,
            'truck_no' => 'TRK-002',
            'driver_name' => 'Peter Kimani',
            'phone' => '+254756789012',
            'capacity' => 8000,
            'status' => 'available',
            'trips_today' => 3,
            'revenue_today' => 72000,
        ]);

        $this->command->info('✅ Commercial Module seeding completed successfully!');
    }
}
