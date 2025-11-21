<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Scheme;
use App\Models\Dma;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComputeDailyKpis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'core-ops:compute-daily-kpis {--scheme_id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Compute and cache daily operational KPIs (hourly execution)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting daily KPI computation...');
        
        $schemeId = $this->option('scheme_id');
        
        $schemes = $schemeId 
            ? Scheme::where('id', $schemeId)->get() 
            : Scheme::all();

        $totalProcessed = 0;

        foreach ($schemes as $scheme) {
            $this->info("Processing scheme: {$scheme->name}");
            
            try {
                // Compute scheme-level KPIs
                $kpis = $this->computeSchemeKpis($scheme);
                
                // Cache KPIs for quick dashboard access
                cache()->put(
                    "scheme_kpis:{$scheme->id}",
                    $kpis,
                    now()->addHours(2)
                );

                // Store in database for historical tracking
                DB::table('operational_kpis')->updateOrInsert(
                    [
                        'scheme_id' => $scheme->id,
                        'computed_at' => Carbon::now()->startOfHour(),
                    ],
                    [
                        'kpis' => json_encode($kpis),
                        'updated_at' => now(),
                    ]
                );

                $totalProcessed++;
                $this->line("  ✓ Computed {$this->count($kpis)} KPIs");
                
            } catch (\Exception $e) {
                $this->error("  ✗ Failed: {$e->getMessage()}");
            }
        }

        $this->info("Completed! Processed {$totalProcessed} schemes.");
        
        return Command::SUCCESS;
    }

    /**
     * Compute comprehensive KPIs for a scheme
     */
    private function computeSchemeKpis(Scheme $scheme): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        return [
            // Production KPIs
            'production' => $this->computeProductionKpis($scheme, $today),
            
            // Distribution KPIs
            'distribution' => $this->computeDistributionKpis($scheme, $today),
            
            // Water Quality KPIs
            'water_quality' => $this->computeWaterQualityKpis($scheme, $today),
            
            // Asset Health KPIs
            'asset_health' => $this->computeAssetHealthKpis($scheme),
            
            // Financial KPIs
            'financial' => $this->computeFinancialKpis($scheme, $today),
            
            // Service Level KPIs
            'service_level' => $this->computeServiceLevelKpis($scheme, $today),
            
            // Computed timestamp
            'computed_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Compute production KPIs (volume, energy consumption)
     */
    private function computeProductionKpis(Scheme $scheme, Carbon $date): array
    {
        // Total production volume from bulk meters
        $productionVolume = DB::table('telemetry_measurements as tm')
            ->join('telemetry_tags as tt', 'tm.telemetry_tag_id', '=', 'tt.id')
            ->join('assets as a', 'tt.asset_id', '=', 'a.id')
            ->where('a.scheme_id', $scheme->id)
            ->where('a.kind', 'meter')
            ->where('a.subkind', 'bulk')
            ->whereDate('tm.ts', $date)
            ->sum('tm.value') ?? 0;

        // Energy consumption
        $energyConsumption = DB::table('telemetry_measurements as tm')
            ->join('telemetry_tags as tt', 'tm.telemetry_tag_id', '=', 'tt.id')
            ->where('tt.scheme_id', $scheme->id)
            ->where('tt.tag_name', 'LIKE', '%energy%')
            ->whereDate('tm.ts', $date)
            ->sum('tm.value') ?? 0;

        $specificEnergy = $productionVolume > 0 
            ? round($energyConsumption / $productionVolume, 2) 
            : 0;

        return [
            'production_volume_m3' => round($productionVolume, 2),
            'energy_consumption_kwh' => round($energyConsumption, 2),
            'specific_energy_kwh_m3' => $specificEnergy,
        ];
    }

    /**
     * Compute distribution KPIs (NRW, pressure, leaks)
     */
    private function computeDistributionKpis(Scheme $scheme, Carbon $date): array
    {
        // NRW from latest snapshots
        $nrwSnapshots = DB::table('nrw_snapshots as ns')
            ->join('dmas as d', 'ns.dma_id', '=', 'd.id')
            ->where('d.scheme_id', $scheme->id)
            ->whereDate('ns.as_of', $date)
            ->selectRaw('AVG(ns.nrw_pct) as avg_nrw_pct, SUM(ns.nrw_m3) as total_nrw_m3')
            ->first();

        // Active leaks
        $activeLeaks = DB::table('work_orders as wo')
            ->where('wo.scheme_id', $scheme->id)
            ->where('wo.kind', 'corrective')
            ->whereJsonContains('wo.tags', 'leak')
            ->whereIn('wo.status', ['open', 'in_progress'])
            ->count();

        return [
            'avg_nrw_pct' => round($nrwSnapshots->avg_nrw_pct ?? 0, 2),
            'total_nrw_m3' => round($nrwSnapshots->total_nrw_m3 ?? 0, 2),
            'active_leak_reports' => $activeLeaks,
        ];
    }

    /**
     * Compute water quality KPIs (compliance, test results)
     */
    private function computeWaterQualityKpis(Scheme $scheme, Carbon $date): array
    {
        // Compliance rate (last 30 days)
        $compliance = DB::table('wq_results as r')
            ->join('wq_samples as s', 'r.sample_id', '=', 's.id')
            ->where('s.scheme_id', $scheme->id)
            ->where('s.collected_at', '>=', $date->copy()->subDays(30))
            ->selectRaw('
                COUNT(*) as total_tests,
                SUM(CASE WHEN r.compliant = true THEN 1 ELSE 0 END) as compliant_tests
            ')
            ->first();

        $complianceRate = $compliance && $compliance->total_tests > 0
            ? round(($compliance->compliant_tests / $compliance->total_tests) * 100, 2)
            : 100;

        return [
            'compliance_rate_pct' => $complianceRate,
            'total_tests_30d' => $compliance->total_tests ?? 0,
        ];
    }

    /**
     * Compute asset health KPIs (availability, MTBF, age)
     */
    private function computeAssetHealthKpis(Scheme $scheme): array
    {
        // Asset availability
        $criticalAssets = DB::table('assets')
            ->where('scheme_id', $scheme->id)
            ->whereIn('kind', ['pump', 'treatment_unit', 'valve'])
            ->selectRaw('
                COUNT(*) as total_assets,
                SUM(CASE WHEN status = \'operational\' THEN 1 ELSE 0 END) as operational_assets
            ')
            ->first();

        $availability = $criticalAssets && $criticalAssets->total_assets > 0
            ? round(($criticalAssets->operational_assets / $criticalAssets->total_assets) * 100, 2)
            : 0;

        // Open work orders
        $openWorkOrders = DB::table('work_orders')
            ->where('scheme_id', $scheme->id)
            ->whereIn('status', ['open', 'in_progress'])
            ->count();

        return [
            'asset_availability_pct' => $availability,
            'open_work_orders' => $openWorkOrders,
        ];
    }

    /**
     * Compute financial KPIs (revenue collection, costs)
     */
    private function computeFinancialKpis(Scheme $scheme, Carbon $date): array
    {
        // Monthly revenue collection (current month)
        $revenue = DB::table('payments')
            ->where('scheme_id', $scheme->id)
            ->whereYear('payment_date', $date->year)
            ->whereMonth('payment_date', $date->month)
            ->sum('amount') ?? 0;

        // Monthly costs (energy + chemicals)
        $costs = DB::table('cost_entries')
            ->where('scheme_id', $scheme->id)
            ->whereYear('entry_date', $date->year)
            ->whereMonth('entry_date', $date->month)
            ->sum('amount') ?? 0;

        return [
            'monthly_revenue' => round($revenue, 2),
            'monthly_costs' => round($costs, 2),
            'operating_ratio' => $revenue > 0 ? round(($costs / $revenue) * 100, 2) : 0,
        ];
    }

    /**
     * Compute service level KPIs (uptime, customer satisfaction)
     */
    private function computeServiceLevelKpis(Scheme $scheme, Carbon $date): array
    {
        // Service hours (24h - outage hours)
        $outageHours = DB::table('outages')
            ->where('scheme_id', $scheme->id)
            ->where('state', 'live')
            ->whereDate('starts_at', $date)
            ->sum(DB::raw('EXTRACT(EPOCH FROM (ends_at - starts_at)) / 3600')) ?? 0;

        $serviceHours = max(0, 24 - $outageHours);
        $uptime = round(($serviceHours / 24) * 100, 2);

        // Active complaints
        $activeComplaints = DB::table('crm_cases')
            ->where('scheme_id', $scheme->id)
            ->where('kind', 'complaint')
            ->whereIn('status', ['open', 'investigating'])
            ->count();

        return [
            'uptime_pct' => $uptime,
            'service_hours' => round($serviceHours, 2),
            'active_complaints' => $activeComplaints,
        ];
    }

    /**
     * Count array elements recursively
     */
    private function count($array): int
    {
        $count = 0;
        array_walk_recursive($array, function() use (&$count) {
            $count++;
        });
        return $count;
    }
}
