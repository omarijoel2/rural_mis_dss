<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Scheme;
use App\Models\Dma;
use App\Services\CoreOps\NrwCalculator;
use Carbon\Carbon;

class RebuildNrwSnapshots extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'core-ops:rebuild-nrw-snapshots {--scheme_id=} {--date=} {--days=7}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuild NRW snapshots for all DMAs (nightly execution)';

    /**
     * NRW Calculator service
     */
    protected NrwCalculator $calculator;

    /**
     * Create a new command instance.
     */
    public function __construct(NrwCalculator $calculator)
    {
        parent::__construct();
        $this->calculator = $calculator;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting NRW snapshot rebuild...');
        
        $schemeId = $this->option('scheme_id');
        $targetDate = $this->option('date') 
            ? Carbon::parse($this->option('date')) 
            : Carbon::yesterday();
        $days = (int) $this->option('days');

        $schemes = $schemeId 
            ? Scheme::where('id', $schemeId)->get() 
            : Scheme::all();

        $totalSnapshots = 0;
        $totalSchemes = 0;

        foreach ($schemes as $scheme) {
            $this->info("Processing scheme: {$scheme->name}");
            
            try {
                // Rebuild snapshots for the last N days
                for ($i = 0; $i < $days; $i++) {
                    $date = $targetDate->copy()->subDays($i);
                    
                    $this->line("  Processing date: {$date->format('Y-m-d')}");
                    
                    $snapshots = $this->calculator->updateAllSnapshotsForScheme($scheme, $date);
                    
                    $totalSnapshots += $snapshots;
                    $this->line("    ✓ Updated {$snapshots} DMA snapshots");
                }

                $totalSchemes++;
                
            } catch (\Exception $e) {
                $this->error("  ✗ Failed: {$e->getMessage()}");
            }
        }

        $this->info("Completed! Processed {$totalSchemes} schemes, {$totalSnapshots} snapshots.");
        
        // Generate summary report
        $this->generateSummaryReport($schemes, $targetDate);
        
        return Command::SUCCESS;
    }

    /**
     * Generate summary report of NRW performance
     */
    private function generateSummaryReport(Collection $schemes, Carbon $asOf): void
    {
        $this->newLine();
        $this->info('=== NRW Performance Summary ===');
        $this->newLine();

        foreach ($schemes as $scheme) {
            $dmas = Dma::where('scheme_id', $scheme->id)->get();
            
            if ($dmas->isEmpty()) {
                continue;
            }

            $this->line("<fg=cyan>{$scheme->name}</>");
            $this->line(str_repeat('-', 60));

            foreach ($dmas as $dma) {
                $snapshot = \App\Models\NrwSnapshot::where('dma_id', $dma->id)
                    ->where('as_of', $asOf->startOfDay())
                    ->first();

                if ($snapshot) {
                    $benchmarks = $this->calculator->calculateBenchmarks($dma);
                    
                    $this->line(sprintf(
                        "  %-30s  NRW: %5.1f%%  (%s)",
                        $dma->name,
                        $snapshot->nrw_pct,
                        $benchmarks['performance_band']
                    ));
                } else {
                    $this->line(sprintf(
                        "  %-30s  <fg=yellow>No data</>",
                        $dma->name
                    ));
                }
            }

            $this->newLine();
        }
    }
}
