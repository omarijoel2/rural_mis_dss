<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dose plans - chlorination and chemical dosing configuration
        Schema::create('dose_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete(); // Chlorinator/booster asset
            $table->string('chemical')->nullable(); // e.g., chlorine, alum, polymer
            $table->jsonb('flow_bands')->nullable(); // [{min_lps, max_lps, target_mg_l}] for different flow rates
            $table->jsonb('thresholds')->nullable(); // {alarm_lo, alarm_hi} residual thresholds
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'scheme_id']);
            $table->index(['asset_id', 'active']);
        });

        // Chemical stocks - inventory tracking
        Schema::create('chemical_stocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->foreignUuid('facility_id')->nullable()->constrained('facilities')->nullOnDelete();
            $table->string('chemical'); // e.g., chlorine HTH, alum, soda ash
            $table->decimal('qty_on_hand_kg', 12, 2)->default(0);
            $table->decimal('reorder_level_kg', 12, 2)->default(0);
            $table->decimal('max_stock_kg', 12, 2)->nullable();
            $table->date('as_of'); // Stock date
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'scheme_id', 'chemical', 'as_of']);
            $table->index(['scheme_id', 'chemical']);
        });

        // Dose change logs - audit trail for dosing adjustments
        Schema::create('dose_change_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dose_plan_id')->constrained('dose_plans')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('before')->nullable(); // Previous dose settings
            $table->jsonb('after')->nullable(); // New dose settings
            $table->text('reason')->nullable();
            $table->timestamps();
            
            $table->index(['dose_plan_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dose_change_logs');
        Schema::dropIfExists('chemical_stocks');
        Schema::dropIfExists('dose_plans');
    }
};
