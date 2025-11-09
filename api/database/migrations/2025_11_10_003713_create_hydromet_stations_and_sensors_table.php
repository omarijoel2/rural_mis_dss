<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('station_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
        });

        Schema::create('datasources', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->integer('sort_order')->default(0);
        });

        Schema::create('sensor_parameters', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('unit', 20);
            $table->text('description')->nullable();
            $table->decimal('min_value', 12, 4)->nullable();
            $table->decimal('max_value', 12, 4)->nullable();
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
        });

        Schema::create('hydromet_stations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->foreignId('station_type_id')->constrained('station_types');
            $table->decimal('elevation_m', 10, 2)->nullable();
            $table->foreignId('datasource_id')->constrained('datasources');
            $table->boolean('active')->default(true);
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'scheme_id']);
            $table->index('code');
            $table->index('active');
        });

        DB::statement('ALTER TABLE hydromet_stations ADD COLUMN location geometry(Point, 4326)');
        DB::statement('CREATE INDEX hydromet_stations_location_idx ON hydromet_stations USING GIST (location)');

        Schema::create('hydromet_sensors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('hydromet_stations')->cascadeOnDelete();
            $table->foreignId('parameter_id')->constrained('sensor_parameters');
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->decimal('multiplier', 10, 4)->default(1.0);
            $table->decimal('offset', 10, 4)->default(0.0);
            $table->date('installed_at')->nullable();
            $table->date('calibrated_at')->nullable();
            $table->boolean('active')->default(true);
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['station_id', 'active']);
            $table->index('parameter_id');
        });

        DB::table('station_types')->insert([
            ['code' => 'rain', 'name' => 'Rainfall Station', 'description' => 'Measures precipitation', 'sort_order' => 1],
            ['code' => 'climate', 'name' => 'Climate Station', 'description' => 'Full weather station (temp, humidity, wind, rain)', 'sort_order' => 2],
            ['code' => 'river_gauge', 'name' => 'River Gauge', 'description' => 'Measures river flow and stage', 'sort_order' => 3],
            ['code' => 'reservoir', 'name' => 'Reservoir Monitor', 'description' => 'Reservoir level and capacity tracking', 'sort_order' => 4],
            ['code' => 'groundwater', 'name' => 'Groundwater Monitor', 'description' => 'Groundwater level monitoring', 'sort_order' => 5],
            ['code' => 'met', 'name' => 'Meteorological', 'description' => 'General meteorological station', 'sort_order' => 6],
            ['code' => 'production', 'name' => 'Production Monitor', 'description' => 'Water production monitoring', 'sort_order' => 7],
        ]);

        DB::table('datasources')->insert([
            ['code' => 'manual', 'name' => 'Manual Entry', 'sort_order' => 1],
            ['code' => 'scada', 'name' => 'SCADA System', 'sort_order' => 2],
            ['code' => 'api', 'name' => 'External API', 'sort_order' => 3],
            ['code' => 'file', 'name' => 'File Import', 'sort_order' => 4],
            ['code' => 'iot', 'name' => 'IoT Device', 'sort_order' => 5],
        ]);

        DB::table('sensor_parameters')->insert([
            ['code' => 'rain_mm', 'name' => 'Rainfall', 'unit' => 'mm', 'min_value' => 0, 'max_value' => 500, 'sort_order' => 1],
            ['code' => 'temp_c', 'name' => 'Temperature', 'unit' => '°C', 'min_value' => -10, 'max_value' => 50, 'sort_order' => 2],
            ['code' => 'rh_pct', 'name' => 'Relative Humidity', 'unit' => '%', 'min_value' => 0, 'max_value' => 100, 'sort_order' => 3],
            ['code' => 'pressure_hpa', 'name' => 'Atmospheric Pressure', 'unit' => 'hPa', 'min_value' => 800, 'max_value' => 1100, 'sort_order' => 4],
            ['code' => 'wind_ms', 'name' => 'Wind Speed', 'unit' => 'm/s', 'min_value' => 0, 'max_value' => 50, 'sort_order' => 5],
            ['code' => 'flow_m3s', 'name' => 'Flow Rate', 'unit' => 'm³/s', 'min_value' => 0, 'max_value' => 1000, 'sort_order' => 6],
            ['code' => 'stage_m', 'name' => 'Water Stage/Level', 'unit' => 'm', 'min_value' => 0, 'max_value' => 100, 'sort_order' => 7],
            ['code' => 'level_m', 'name' => 'Groundwater Level', 'unit' => 'm', 'min_value' => 0, 'max_value' => 200, 'sort_order' => 8],
            ['code' => 'production_m3h', 'name' => 'Production Rate', 'unit' => 'm³/h', 'min_value' => 0, 'max_value' => 10000, 'sort_order' => 9],
            ['code' => 'pressure_bar', 'name' => 'Water Pressure', 'unit' => 'bar', 'min_value' => 0, 'max_value' => 20, 'sort_order' => 10],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('hydromet_sensors');
        Schema::dropIfExists('hydromet_stations');
        Schema::dropIfExists('sensor_parameters');
        Schema::dropIfExists('datasources');
        Schema::dropIfExists('station_types');
    }
};
