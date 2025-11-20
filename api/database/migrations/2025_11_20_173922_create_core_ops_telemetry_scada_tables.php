<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Telemetry tags - configuration for SCADA points
        Schema::create('telemetry_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->foreignUuid('asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->foreignUuid('network_node_id')->nullable()->constrained('network_nodes')->nullOnDelete();
            $table->string('tag')->unique(); // e.g., SCADA.PS1.FLOW
            $table->enum('io_type', ['AI', 'DI', 'DO', 'AO'])->default('AI'); // Analog/Digital Input/Output
            $table->string('unit')->nullable(); // m3/h, bar, mg/L, kW
            $table->jsonb('scale')->nullable(); // {min, max, offset} for scaling
            $table->jsonb('thresholds')->nullable(); // {lo, loLo, hi, hiHi} alarm thresholds
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'scheme_id']);
            $table->index(['asset_id', 'io_type']);
        });

        // Telemetry measurements - time-series data (can be converted to TimescaleDB hypertable)
        Schema::create('telemetry_measurements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('telemetry_tag_id')->constrained('telemetry_tags')->cascadeOnDelete();
            $table->timestampTz('ts'); // Measurement timestamp
            $table->double('value')->nullable();
            $table->jsonb('meta')->nullable(); // Quality flag, source, etc.
            $table->timestamps();
            
            $table->index(['telemetry_tag_id', 'ts']);
            $table->index('ts');
        });

        // Note: For production with high-frequency data, convert to TimescaleDB hypertable:
        // SELECT create_hypertable('telemetry_measurements', by_range('ts'), if_not_exists => TRUE);
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_measurements');
        Schema::dropIfExists('telemetry_tags');
    }
};
