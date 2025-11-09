<?php

namespace Database\Seeders;

use App\Models\CrmCustomer;
use App\Models\CrmPremise;
use App\Models\CrmServiceConnection;
use App\Models\CrmMeter;
use App\Models\CrmTariff;
use App\Models\CrmInvoice;
use App\Models\CrmInvoiceLine;
use App\Models\CrmPayment;
use App\Models\CrmAccountBalance;
use App\Models\CrmCustomerRead;
use App\Models\CrmRaRule;
use App\Models\Scheme;
use App\Models\Dma;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use MatanYadaev\EloquentSpatial\Objects\Point;
use Carbon\Carbon;

class CrmSeeder extends Seeder
{
    private $tenantId;
    private $userId;
    private $schemeId;
    private $dmaId;

    public function run(): void
    {
        DB::beginTransaction();
        try {
            $this->setup();
            $this->seedTariffs();
            $this->seedRaRules();
            $customers = $this->seedCustomers(100);
            $premises = $this->seedPremises(80, $customers);
            $connections = $this->seedConnections($premises);
            $meters = $this->seedMeters($connections);
            $this->seedMeterReads($meters);
            $this->seedInvoicesAndPayments($connections);

            DB::commit();
            echo "CRM demo data seeded successfully.\n";
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function setup(): void
    {
        $user = User::whereHas('tenant')->first();
        if (!$user) {
            echo "No user with tenant found. Run DatabaseSeeder first.\n";
            return;
        }

        $this->userId = $user->id;
        $this->tenantId = $user->currentTenantId();

        $scheme = Scheme::where('tenant_id', $this->tenantId)->first();
        $this->schemeId = $scheme?->id;

        $dma = Dma::where('scheme_id', $this->schemeId)->first();
        $this->dmaId = $dma?->id;
    }

    private function seedTariffs(): void
    {
        CrmTariff::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Residential Standard',
            'category' => 'residential',
            'blocks' => [
                ['min' => 0, 'max' => 10, 'rate' => 50],
                ['min' => 11, 'max' => 50, 'rate' => 75],
                ['min' => 51, 'max' => null, 'rate' => 100],
            ],
            'is_active' => true,
        ]);

        CrmTariff::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Commercial',
            'category' => 'commercial',
            'blocks' => [
                ['min' => 0, 'max' => 50, 'rate' => 100],
                ['min' => 51, 'max' => null, 'rate' => 150],
            ],
            'is_active' => true,
        ]);
    }

    private function seedRaRules(): void
    {
        CrmRaRule::create([
            'tenant_id' => $this->tenantId,
            'name' => 'Zero Consumption Detection',
            'rule_type' => 'zero_consumption',
            'config' => ['consecutive_months' => 3],
            'priority' => 80,
            'is_active' => true,
        ]);

        CrmRaRule::create([
            'tenant_id' => $this->tenantId,
            'name' => 'High Consumption Spike',
            'rule_type' => 'high_consumption',
            'config' => ['threshold_multiplier' => 3],
            'priority' => 90,
            'is_active' => true,
        ]);
    }

    private function seedCustomers(int $count): array
    {
        $customers = [];
        for ($i = 1; $i <= $count; $i++) {
            $customers[] = CrmCustomer::create([
                'tenant_id' => $this->tenantId,
                'first_name' => 'Customer' . $i,
                'last_name' => 'Lastname' . $i,
                'id_number' => '3' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'phone' => '254' . rand(700000000, 799999999),
                'email' => "customer{$i}@example.com",
                'customer_type' => $i % 5 == 0 ? 'commercial' : 'residential',
            ]);
        }
        return $customers;
    }

    private function seedPremises(int $count, array $customers): array
    {
        $premises = [];
        $baseCoords = [-1.286389, 36.817223];

        for ($i = 1; $i <= $count; $i++) {
            $lat = $baseCoords[0] + (rand(-1000, 1000) / 10000);
            $lng = $baseCoords[1] + (rand(-1000, 1000) / 10000);

            $premises[] = CrmPremise::create([
                'tenant_id' => $this->tenantId,
                'scheme_id' => $this->schemeId,
                'dma_id' => $this->dmaId,
                'address' => "Plot {$i}, Test Street",
                'category' => $i % 5 == 0 ? 'commercial' : 'residential',
                'location' => new Point($lat, $lng),
            ]);
        }
        return $premises;
    }

    private function seedConnections(array $premises): array
    {
        $connections = [];
        $tariffs = CrmTariff::all();

        foreach ($premises as $idx => $premise) {
            $accountNo = 'ACC' . str_pad($idx + 1, 6, '0', STR_PAD_LEFT);

            $connections[] = CrmServiceConnection::create([
                'tenant_id' => $this->tenantId,
                'premise_id' => $premise->id,
                'customer_id' => CrmCustomer::inRandomOrder()->first()->id,
                'account_no' => $accountNo,
                'tariff_id' => $tariffs->random()->id,
                'status' => rand(1, 100) > 10 ? 'active' : 'suspended',
                'connected_at' => Carbon::now()->subMonths(rand(6, 36)),
            ]);
        }
        return $connections;
    }

    private function seedMeters(array $connections): array
    {
        $meters = [];
        foreach ($connections as $idx => $connection) {
            $meterNo = 'MTR' . str_pad($idx + 1, 8, '0', STR_PAD_LEFT);

            $meters[] = CrmMeter::create([
                'tenant_id' => $this->tenantId,
                'connection_id' => $connection->id,
                'meter_no' => $meterNo,
                'make' => ['Itron', 'Sensus', 'Kamstrup'][rand(0, 2)],
                'size' => ['15mm', '20mm'][rand(0, 1)],
                'status' => 'active',
                'install_date' => Carbon::now()->subMonths(rand(6, 24)),
            ]);
        }
        return $meters;
    }

    private function seedMeterReads(array $meters): void
    {
        foreach ($meters as $meter) {
            $baseValue = rand(1000, 5000);
            for ($month = 6; $month >= 0; $month--) {
                CrmCustomerRead::create([
                    'tenant_id' => $this->tenantId,
                    'meter_id' => $meter->id,
                    'value' => $baseValue + ($month * rand(5, 50)),
                    'read_at' => Carbon::now()->subMonths($month)->startOfMonth(),
                    'quality' => 'good',
                    'source' => 'manual',
                ]);
            }
        }
    }

    private function seedInvoicesAndPayments(array $connections): void
    {
        foreach ($connections as $connection) {
            for ($month = 3; $month >= 0; $month--) {
                $periodStart = Carbon::now()->subMonths($month)->startOfMonth();
                $periodEnd = $periodStart->copy()->endOfMonth();

                $consumption = rand(10, 100);
                $waterCharge = $consumption * 75;
                $sewerage = $waterCharge * 0.75;
                $total = $waterCharge + $sewerage;

                $invoice = CrmInvoice::create([
                    'tenant_id' => $this->tenantId,
                    'connection_id' => $connection->id,
                    'period_start' => $periodStart,
                    'period_end' => $periodEnd,
                    'total_amount' => $total,
                    'status' => $month == 0 ? 'pending' : 'paid',
                    'issued_at' => $periodEnd,
                    'due_at' => $periodEnd->copy()->addDays(14),
                ]);

                CrmInvoiceLine::create([
                    'tenant_id' => $this->tenantId,
                    'invoice_id' => $invoice->id,
                    'item' => 'Water Charges',
                    'quantity' => $consumption,
                    'unit_price' => 75,
                    'amount' => $waterCharge,
                ]);

                CrmInvoiceLine::create([
                    'tenant_id' => $this->tenantId,
                    'invoice_id' => $invoice->id,
                    'item' => 'Sewerage',
                    'quantity' => 1,
                    'unit_price' => $sewerage,
                    'amount' => $sewerage,
                ]);

                if ($month > 0 && rand(1, 100) > 20) {
                    CrmPayment::create([
                        'tenant_id' => $this->tenantId,
                        'connection_id' => $connection->id,
                        'amount' => $total,
                        'channel' => ['mpesa', 'bank', 'cash'][rand(0, 2)],
                        'reference' => 'PAY' . rand(100000, 999999),
                        'paid_at' => $periodEnd->copy()->addDays(rand(1, 10)),
                    ]);
                }
            }

            $totalInvoiced = $connection->invoices()->sum('total_amount');
            $totalPaid = $connection->payments()->sum('amount');
            $balance = $totalInvoiced - $totalPaid;

            CrmAccountBalance::create([
                'tenant_id' => $this->tenantId,
                'connection_id' => $connection->id,
                'balance' => $balance,
                'current' => $balance > 0 ? min($balance, rand(500, 2000)) : 0,
                'days_30' => $balance > 2000 ? rand(500, 1500) : 0,
                'days_60' => $balance > 3500 ? rand(500, 1000) : 0,
                'days_90' => $balance > 5000 ? rand(500, 1000) : 0,
                'over_90' => $balance > 6000 ? rand(500, 2000) : 0,
                'as_of' => Carbon::now(),
            ]);
        }
    }
}
