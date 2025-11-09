<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quality_flags', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('color', 20)->nullable();
            $table->integer('sort_order')->default(0);
        });

        DB::statement("
            CREATE TABLE timeseries (
                id BIGSERIAL,
                sensor_id BIGINT NOT NULL,
                observed_at TIMESTAMPTZ NOT NULL,
                value NUMERIC(12, 4),
                quality_id BIGINT,
                meta JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT fk_sensor FOREIGN KEY (sensor_id) REFERENCES hydromet_sensors(id) ON DELETE CASCADE,
                CONSTRAINT fk_quality FOREIGN KEY (quality_id) REFERENCES quality_flags(id),
                CONSTRAINT check_value_not_null CHECK (value IS NOT NULL)
            ) PARTITION BY RANGE (observed_at)
        ");

        DB::statement("CREATE INDEX timeseries_observed_at_idx ON timeseries USING BRIN (observed_at)");
        DB::statement("CREATE INDEX timeseries_sensor_observed_idx ON timeseries (sensor_id, observed_at)");
        DB::statement("CREATE INDEX timeseries_quality_idx ON timeseries (quality_id) WHERE quality_id IS NOT NULL");

        $now = new \DateTime('first day of this month');
        
        for ($monthsBack = 6; $monthsBack >= 0; $monthsBack--) {
            $start = (clone $now)->modify("-{$monthsBack} months");
            $end = (clone $start)->modify('+1 month');
            $partitionName = 'timeseries_' . $start->format('Y_m');
            
            DB::statement("
                CREATE TABLE {$partitionName} PARTITION OF timeseries
                FOR VALUES FROM ('{$start->format('Y-m-d')}') TO ('{$end->format('Y-m-d')}')
            ");
        }

        for ($monthsAhead = 1; $monthsAhead <= 6; $monthsAhead++) {
            $start = (clone $now)->modify("+{$monthsAhead} months");
            $end = (clone $start)->modify('+1 month');
            $partitionName = 'timeseries_' . $start->format('Y_m');
            
            DB::statement("
                CREATE TABLE {$partitionName} PARTITION OF timeseries
                FOR VALUES FROM ('{$start->format('Y-m-d')}') TO ('{$end->format('Y-m-d')}')
            ");
        }

        DB::table('quality_flags')->insert([
            ['code' => 'good', 'name' => 'Good', 'color' => 'green', 'sort_order' => 1],
            ['code' => 'suspect', 'name' => 'Suspect', 'color' => 'yellow', 'sort_order' => 2],
            ['code' => 'missing', 'name' => 'Missing/Filled', 'color' => 'orange', 'sort_order' => 3],
            ['code' => 'bad', 'name' => 'Bad/Rejected', 'color' => 'red', 'sort_order' => 4],
        ]);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS timeseries CASCADE');
        Schema::dropIfExists('quality_flags');
    }
};
