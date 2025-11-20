<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pump schedules - planned pump operation windows
        Schema::create('pump_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete(); // Pump asset
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->timestampTz('start_at');
            $table->timestampTz('end_at');
            $table->enum('status', ['scheduled', 'running', 'completed', 'cancelled'])->default('scheduled');
            $table->jsonb('constraints')->nullable(); // {reservoir_targets, tariff_band, power_limit}
            $table->enum('source', ['manual', 'optimizer'])->default('manual');
            $table->decimal('target_volume_m3', 12, 2)->nullable();
            $table->decimal('actual_volume_m3', 12, 2)->nullable();
            $table->decimal('energy_cost', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['asset_id', 'start_at']);
            $table->index(['scheme_id', 'status']);
            $table->index(['start_at', 'end_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pump_schedules');
    }
};
