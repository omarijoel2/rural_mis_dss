<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // NRW snapshots - periodic water balance for DMAs
        Schema::create('nrw_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('dma_id')->constrained('dmas')->cascadeOnDelete();
            $table->date('as_of'); // Snapshot date
            $table->decimal('system_input_volume_m3', 14, 2)->default(0);
            $table->decimal('billed_authorized_m3', 14, 2)->default(0);
            $table->decimal('unbilled_authorized_m3', 14, 2)->default(0);
            $table->decimal('apparent_losses_m3', 14, 2)->default(0); // Metering errors, theft
            $table->decimal('real_losses_m3', 14, 2)->default(0); // Leakage
            $table->decimal('nrw_m3', 14, 2)->default(0); // Total NRW
            $table->decimal('nrw_pct', 6, 3)->default(0); // NRW percentage
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'dma_id', 'as_of']);
            $table->index(['dma_id', 'as_of']);
        });

        // Interventions - NRW reduction activities
        Schema::create('interventions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('dma_id')->nullable()->constrained('dmas')->nullOnDelete();
            $table->foreignUuid('asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->enum('type', ['leak_repair', 'meter_replacement', 'prv_tuning', 'sectorization', 'campaign', 'other'])->default('leak_repair');
            $table->date('date');
            $table->decimal('estimated_savings_m3d', 10, 2)->nullable();
            $table->decimal('realized_savings_m3d', 10, 2)->nullable();
            $table->decimal('cost', 12, 2)->nullable();
            $table->string('responsible')->nullable();
            $table->date('follow_up_at')->nullable();
            $table->jsonb('evidence')->nullable(); // Photos, measurements, reports
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'dma_id', 'date']);
            $table->index(['type', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interventions');
        Schema::dropIfExists('nrw_snapshots');
    }
};
