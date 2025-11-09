<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forecast_models', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
        });

        Schema::create('forecast_variables', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('unit', 20);
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
        });

        Schema::create('drought_stages', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('color', 20)->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
        });

        Schema::create('forecast_grids', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('model_id')->constrained('forecast_models');
            $table->timestampTz('run_at');
            $table->timestampTz('valid_from');
            $table->timestampTz('valid_to');
            $table->foreignId('variable_id')->constrained('forecast_variables');
            $table->bytea('grid_data')->nullable();
            $table->jsonb('grid_meta')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'model_id', 'run_at']);
            $table->index(['valid_from', 'valid_to']);
        });

        DB::statement('ALTER TABLE forecast_grids ADD COLUMN bbox geometry(Polygon, 4326)');
        DB::statement('CREATE INDEX forecast_grids_bbox_idx ON forecast_grids USING GIST (bbox)');

        Schema::create('hydro_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->date('period_date');
            $table->string('granularity', 20);
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->foreignUuid('dma_id')->nullable()->constrained('dmas')->nullOnDelete();
            $table->decimal('rainfall_mm', 10, 2)->nullable();
            $table->decimal('spi_1m', 10, 4)->nullable();
            $table->decimal('spi_3m', 10, 4)->nullable();
            $table->decimal('spi_6m', 10, 4)->nullable();
            $table->decimal('storage_pct', 10, 2)->nullable();
            $table->decimal('inflow_m3', 12, 2)->nullable();
            $table->foreignId('drought_stage_id')->nullable()->constrained('drought_stages');
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'period_date', 'granularity']);
            $table->index(['scheme_id', 'period_date']);
            $table->index(['dma_id', 'period_date']);
            $table->unique(['tenant_id', 'period_date', 'granularity', 'scheme_id', 'dma_id'], 'unique_indicator_period');
        });

        DB::table('forecast_models')->insert([
            ['code' => 'gfs', 'name' => 'GFS (NOAA)', 'description' => 'Global Forecast System', 'sort_order' => 1],
            ['code' => 'era5', 'name' => 'ERA5 (ECMWF)', 'description' => 'ECMWF Reanalysis v5', 'sort_order' => 2],
            ['code' => 'imerg', 'name' => 'IMERG (NASA)', 'description' => 'Integrated Multi-satellitE Retrievals for GPM', 'sort_order' => 3],
            ['code' => 'local', 'name' => 'Local Model', 'description' => 'Internal forecast model', 'sort_order' => 4],
        ]);

        DB::table('forecast_variables')->insert([
            ['code' => 'rain_mm', 'name' => 'Rainfall', 'unit' => 'mm', 'sort_order' => 1],
            ['code' => 'temp_c', 'name' => 'Temperature', 'unit' => '°C', 'sort_order' => 2],
            ['code' => 'wind_ms', 'name' => 'Wind Speed', 'unit' => 'm/s', 'sort_order' => 3],
            ['code' => 'pet_mm', 'name' => 'Potential Evapotranspiration', 'unit' => 'mm', 'sort_order' => 4],
        ]);

        DB::table('drought_stages')->insert([
            ['code' => 'normal', 'name' => 'Normal', 'color' => 'green', 'description' => 'Normal conditions', 'sort_order' => 1],
            ['code' => 'watch', 'name' => 'Drought Watch', 'color' => 'yellow', 'description' => 'Potential drought developing', 'sort_order' => 2],
            ['code' => 'warning', 'name' => 'Drought Warning', 'color' => 'orange', 'description' => 'Drought conditions present', 'sort_order' => 3],
            ['code' => 'emergency', 'name' => 'Drought Emergency', 'color' => 'red', 'description' => 'Severe drought conditions', 'sort_order' => 4],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('hydro_indicators');
        Schema::dropIfExists('forecast_grids');
        Schema::dropIfExists('drought_stages');
        Schema::dropIfExists('forecast_variables');
        Schema::dropIfExists('forecast_models');
    }
};
