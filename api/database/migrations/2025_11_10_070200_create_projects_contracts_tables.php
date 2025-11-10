<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 50)->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('program_id')->nullable()->constrained('programs')->nullOnDelete();
            $table->foreignId('category_id')->constrained('project_categories')->cascadeOnDelete();
            $table->foreignId('pipeline_id')->nullable()->constrained('investment_pipelines')->nullOnDelete();
            $table->foreignUuid('pm_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('baseline_budget', 20, 2);
            $table->decimal('revised_budget', 20, 2)->nullable();
            $table->date('baseline_start_date');
            $table->date('baseline_end_date');
            $table->date('revised_start_date')->nullable();
            $table->date('revised_end_date')->nullable();
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->decimal('physical_progress', 5, 2)->default(0); // Percentage
            $table->decimal('financial_progress', 5, 2)->default(0); // Percentage
            $table->enum('status', ['planning', 'tendering', 'execution', 'suspended', 'completed', 'closed'])->default('planning');
            $table->geography('location', 'polygon')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->nullOnDelete();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'program_id']);
            $table->spatialIndex('location');
        });

        Schema::create('project_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('planned_date');
            $table->date('actual_date')->nullable();
            $table->decimal('progress', 5, 2)->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'delayed'])->default('pending');
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'planned_date']);
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('contract_no', 50)->index();
            $table->string('contractor_name');
            $table->string('contractor_contact')->nullable();
            $table->enum('type', ['works', 'services', 'goods', 'consultancy']);
            $table->decimal('contract_sum', 20, 2);
            $table->decimal('revised_sum', 20, 2)->nullable();
            $table->date('signing_date');
            $table->date('commencement_date');
            $table->date('completion_date');
            $table->date('extended_completion_date')->nullable();
            $table->integer('defects_liability_months')->default(12);
            $table->enum('status', ['signed', 'active', 'suspended', 'completed', 'terminated'])->default('signed');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'contract_no']);
            $table->index(['tenant_id', 'status']);
            $table->index(['project_id']);
        });

        Schema::create('change_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('vo_no', 50)->index(); // Variation Order Number
            $table->text('description');
            $table->decimal('amount', 20, 2);
            $table->enum('type', ['addition', 'omission', 'time_extension']);
            $table->integer('time_extension_days')->nullable();
            $table->text('justification')->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->foreignUuid('requested_by')->constrained('users')->nullOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['contract_id', 'status']);
        });

        Schema::create('contractor_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('claim_no', 50)->index();
            $table->text('description');
            $table->decimal('claimed_amount', 20, 2);
            $table->decimal('approved_amount', 20, 2)->nullable();
            $table->enum('type', ['payment_certificate', 'final_account', 'dispute', 'other']);
            $table->date('claim_date');
            $table->date('response_date')->nullable();
            $table->enum('status', ['submitted', 'under_review', 'approved', 'rejected', 'disputed'])->default('submitted');
            $table->text('response_notes')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['contract_id', 'status']);
        });

        Schema::create('project_defects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->string('defect_no', 50)->index();
            $table->text('description');
            $table->enum('severity', ['minor', 'major', 'critical'])->default('minor');
            $table->geography('location', 'point')->nullable();
            $table->date('identified_date');
            $table->date('deadline_date')->nullable();
            $table->date('rectified_date')->nullable();
            $table->enum('status', ['open', 'in_progress', 'rectified', 'verified', 'closed'])->default('open');
            $table->foreignUuid('reported_by')->constrained('users')->nullOnDelete();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status']);
            $table->spatialIndex('location');
        });

        Schema::create('progress_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->date('report_date');
            $table->decimal('physical_progress', 5, 2);
            $table->decimal('financial_progress', 5, 2);
            $table->decimal('expenditure_to_date', 20, 2);
            $table->text('achievements')->nullable();
            $table->text('challenges')->nullable();
            $table->text('next_steps')->nullable();
            $table->foreignUuid('submitted_by')->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['project_id', 'report_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_reports');
        Schema::dropIfExists('project_defects');
        Schema::dropIfExists('contractor_claims');
        Schema::dropIfExists('change_orders');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('project_milestones');
        Schema::dropIfExists('projects');
    }
};
