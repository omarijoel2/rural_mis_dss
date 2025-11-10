<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investment_pipelines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 50)->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('program_id')->nullable()->constrained('programs')->nullOnDelete();
            $table->foreignUuid('category_id')->constrained('project_categories')->cascadeOnDelete();
            $table->decimal('estimated_cost', 20, 2);
            $table->string('currency', 3)->default('KES');
            $table->integer('connections_added')->nullable();
            $table->decimal('energy_savings', 15, 2)->nullable();
            $table->decimal('nrw_reduction', 15, 2)->nullable();
            $table->decimal('revenue_increase', 15, 2)->nullable();
            $table->decimal('bcr', 10, 4)->nullable(); // Benefit-Cost Ratio
            $table->decimal('npv', 20, 2)->nullable();
            $table->decimal('irr', 10, 4)->nullable();
            $table->decimal('risk_reduction_score', 10, 2)->nullable();
            $table->decimal('priority_score', 10, 2)->nullable();
            $table->enum('status', ['active', 'shortlisted', 'approved', 'rejected', 'converted'])->default('active');
            $table->geography('location', 'polygon')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->nullOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'program_id']);
            $table->spatialIndex('location');
        });

        Schema::create('pipeline_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pipeline_id')->constrained('investment_pipelines')->cascadeOnDelete();
            $table->foreignUuid('criterion_id')->constrained('investment_criteria')->cascadeOnDelete();
            $table->decimal('raw_score', 10, 2);
            $table->decimal('weighted_score', 10, 2);
            $table->text('rationale')->nullable();
            $table->foreignUuid('scored_by')->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['pipeline_id', 'criterion_id']);
            $table->index(['pipeline_id']);
        });

        Schema::create('investment_appraisals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pipeline_id')->constrained('investment_pipelines')->cascadeOnDelete();
            $table->string('appraisal_no', 50)->index();
            $table->foreignUuid('appraiser_id')->constrained('users')->nullOnDelete();
            $table->date('appraisal_date');
            $table->text('executive_summary')->nullable();
            $table->decimal('capex', 20, 2);
            $table->decimal('opex_annual', 20, 2)->nullable();
            $table->integer('project_life_years')->default(20);
            $table->decimal('discount_rate', 5, 4)->default(0.08);
            $table->decimal('calculated_npv', 20, 2)->nullable();
            $table->decimal('calculated_bcr', 10, 4)->nullable();
            $table->decimal('calculated_irr', 10, 4)->nullable();
            $table->text('risks')->nullable();
            $table->text('assumptions')->nullable();
            $table->enum('recommendation', ['approve', 'reject', 'defer', 'revise'])->nullable();
            $table->text('recommendation_notes')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->jsonb('cash_flows')->nullable(); // Yearly cash flows
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['pipeline_id']);
            $table->index(['appraisal_date']);
        });

        Schema::create('portfolio_scenarios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('budget_constraint', 20, 2);
            $table->string('optimization_method')->default('max_bcr');
            $table->jsonb('selected_pipelines')->nullable(); // Array of pipeline IDs
            $table->decimal('total_cost', 20, 2)->nullable();
            $table->decimal('total_npv', 20, 2)->nullable();
            $table->foreignUuid('created_by')->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_scenarios');
        Schema::dropIfExists('investment_appraisals');
        Schema::dropIfExists('pipeline_scores');
        Schema::dropIfExists('investment_pipelines');
    }
};
