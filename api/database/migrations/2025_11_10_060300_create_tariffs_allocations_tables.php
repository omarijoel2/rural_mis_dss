<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('energy_tariffs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->decimal('peak_rate', 10, 4);
            $table->decimal('offpeak_rate', 10, 4);
            $table->decimal('demand_charge', 10, 4)->nullable();
            $table->string('currency', 3)->default('KES');
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'valid_from', 'valid_to']);
        });

        Schema::create('chemical_tariffs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->string('item_code', 50);
            $table->decimal('unit_cost', 10, 4);
            $table->string('unit', 20);
            $table->string('currency', 3)->default('KES');
            $table->timestamps();

            $table->index(['tenant_id', 'item_code', 'valid_from']);
        });

        Schema::create('allocation_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('basis', ['volume', 'connections', 'km_pipe', 'head_kwh', 'tickets', 'staff_time', 'custom_driver']);
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->text('formula')->nullable();
            $table->enum('applies_to', ['opex', 'capex', 'both'])->default('opex');
            $table->boolean('active')->default(true);
            $table->jsonb('scope_filter')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'active']);
        });

        Schema::create('alloc_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('version_id')->nullable()->constrained('budget_versions')->nullOnDelete();
            $table->foreignId('forecast_id')->nullable()->constrained('forecasts')->nullOnDelete();
            $table->date('period_from');
            $table->date('period_to');
            $table->enum('status', ['queued', 'running', 'done', 'failed'])->default('queued');
            $table->jsonb('meta')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });

        Schema::create('alloc_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained('alloc_runs')->cascadeOnDelete();
            $table->foreignId('gl_account_id')->constrained('gl_accounts');
            $table->foreignId('cost_center_id')->constrained('cost_centers');
            $table->unsignedBigInteger('scheme_id')->nullable();
            $table->unsignedBigInteger('dma_id')->nullable();
            $table->enum('class', ['domestic', 'commercial', 'institutional', 'kiosk'])->nullable();
            $table->date('period');
            $table->decimal('amount', 20, 2);
            $table->decimal('driver_value', 20, 4)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['run_id', 'period']);
            $table->index(['gl_account_id', 'cost_center_id', 'period']);
            $table->index(['scheme_id', 'period']);
        });

        Schema::create('cost_to_serve', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->date('period');
            $table->unsignedBigInteger('scheme_id')->nullable();
            $table->unsignedBigInteger('dma_id')->nullable();
            $table->enum('class', ['domestic', 'commercial', 'institutional', 'kiosk'])->nullable();
            $table->decimal('production_m3', 20, 2)->default(0);
            $table->decimal('billed_m3', 20, 2)->default(0);
            $table->decimal('opex_cost', 20, 2)->default(0);
            $table->decimal('capex_depr', 20, 2)->default(0);
            $table->decimal('energy_kwh', 20, 2)->default(0);
            $table->decimal('energy_cost', 20, 2)->default(0);
            $table->decimal('chemical_cost', 20, 2)->default(0);
            $table->decimal('other_cost', 20, 2)->default(0);
            $table->decimal('cost_per_m3', 20, 4)->default(0);
            $table->decimal('revenue_per_m3', 20, 4)->default(0);
            $table->decimal('margin_per_m3', 20, 4)->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'period']);
            $table->index(['scheme_id', 'period']);
            $table->index(['dma_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_to_serve');
        Schema::dropIfExists('alloc_results');
        Schema::dropIfExists('alloc_runs');
        Schema::dropIfExists('allocation_rules');
        Schema::dropIfExists('chemical_tariffs');
        Schema::dropIfExists('energy_tariffs');
    }
};
