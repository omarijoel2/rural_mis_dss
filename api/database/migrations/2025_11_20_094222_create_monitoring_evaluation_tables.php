<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // KPI Catalog (WHO/JMP, WASREB aligned)
        Schema::create('kpis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('standard', ['jmp', 'wasreb', 'internal', 'custom'])->default('internal');
            $table->string('unit')->nullable();
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'annual'])->default('monthly');
            $table->jsonb('formula')->nullable()->comment('Calculation formula as JSON');
            $table->foreignUuid('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('thresholds')->nullable()->comment('Red/amber/green thresholds');
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // KPI Values (actual measurements)
        Schema::create('kpi_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('kpi_id')->constrained('kpis')->cascadeOnDelete();
            $table->string('entity_type')->comment('Scheme, DMA, Facility, etc.');
            $table->uuid('entity_id');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('value', 15, 4);
            $table->string('source')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('evidence')->nullable()->comment('Attachments, notes, audit trail');
            $table->timestamps();
            
            $table->index(['tenant_id', 'kpi_id', 'entity_type', 'entity_id', 'period_start']);
            $table->index(['entity_type', 'entity_id']);
        });

        // Indicators (Results Framework)
        Schema::create('indicators', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('level', ['impact', 'outcome', 'output', 'activity'])->default('output');
            $table->string('unit')->nullable();
            $table->decimal('baseline_value', 15, 4)->nullable();
            $table->date('baseline_date')->nullable();
            $table->decimal('target_value', 15, 4)->nullable();
            $table->date('target_date')->nullable();
            $table->enum('frequency', ['monthly', 'quarterly', 'annual', 'milestone'])->default('quarterly');
            $table->text('means_of_verification')->nullable();
            $table->jsonb('disaggregation_schema')->nullable()->comment('Gender, age, quintile breakdowns');
            $table->foreignUuid('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'level']);
        });

        // Indicator Data Points (time series)
        Schema::create('indicator_data_points', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('indicator_id')->constrained('indicators')->cascadeOnDelete();
            $table->date('date');
            $table->decimal('value', 15, 4);
            $table->string('source')->nullable();
            $table->jsonb('disaggregation')->nullable()->comment('Breakdown by gender, age, etc.');
            $table->jsonb('meta')->nullable()->comment('Notes, evidence, approver');
            $table->timestamps();
            
            $table->index(['tenant_id', 'indicator_id', 'date']);
        });

        // NRW Initiatives (Non-Revenue Water programs)
        Schema::create('nrw_initiatives', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('name');
            $table->enum('type', ['pressure_mgmt', 'leak_detection', 'meter_replacement', 'sectorization', 'prv_optimization', 'other'])->default('other');
            $table->jsonb('dma_ids')->nullable()->comment('Array of DMA UUIDs');
            $table->decimal('cost', 12, 2)->default(0);
            $table->decimal('estimated_savings_m3_day', 10, 2)->nullable();
            $table->decimal('roi_percent', 5, 2)->nullable();
            $table->enum('stage', ['proposed', 'approved', 'in_implementation', 'verified', 'closed'])->default('proposed');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('assumptions')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'stage']);
        });

        // NRW Savings (realized savings over time)
        Schema::create('nrw_savings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('initiative_id')->constrained('nrw_initiatives')->cascadeOnDelete();
            $table->date('date');
            $table->decimal('realized_savings_m3_day', 10, 2);
            $table->decimal('confidence_percent', 5, 2)->default(100);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'initiative_id', 'date']);
        });

        // Surveys (CX/CSAT/NPS templates)
        Schema::create('surveys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['nps', 'csat', 'ces', 'custom'])->default('csat');
            $table->jsonb('template')->comment('Questions array with types');
            $table->enum('channel', ['sms', 'email', 'whatsapp', 'ussd', 'app', 'call'])->default('sms');
            $table->jsonb('sample_rules')->nullable()->comment('Targeting rules');
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // Survey Responses
        Schema::create('survey_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('survey_id')->constrained('surveys')->cascadeOnDelete();
            $table->foreignUuid('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('scores')->nullable()->comment('NPS score, ratings, etc.');
            $table->jsonb('text')->nullable()->comment('Free text responses');
            $table->jsonb('meta')->nullable()->comment('Channel, timestamp, session');
            $table->timestamp('responded_at')->useCurrent();
            $table->timestamps();
            
            $table->index(['tenant_id', 'survey_id', 'responded_at']);
        });

        // Coverage Statistics (by ward/area)
        Schema::create('coverage_stats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('area_type')->comment('ward, sub_county, county, dma');
            $table->uuid('area_id');
            $table->string('indicator')->comment('water_coverage, sanitation_coverage, etc.');
            $table->date('period_date');
            $table->integer('population_total')->default(0);
            $table->integer('population_served')->default(0);
            $table->decimal('coverage_percent', 5, 2)->default(0);
            $table->jsonb('disaggregation')->nullable()->comment('By gender, quintile, etc.');
            $table->timestamps();
            
            $table->index(['tenant_id', 'area_type', 'area_id', 'period_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coverage_stats');
        Schema::dropIfExists('survey_responses');
        Schema::dropIfExists('surveys');
        Schema::dropIfExists('nrw_savings');
        Schema::dropIfExists('nrw_initiatives');
        Schema::dropIfExists('indicator_data_points');
        Schema::dropIfExists('indicators');
        Schema::dropIfExists('kpi_values');
        Schema::dropIfExists('kpis');
    }
};
