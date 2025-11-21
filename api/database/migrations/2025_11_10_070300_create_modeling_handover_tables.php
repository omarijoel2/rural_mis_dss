<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('design_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('model_name');
            $table->foreignUuid('engine_id')->constrained('model_engines')->cascadeOnDelete();
            $table->string('version')->nullable();
            $table->foreignUuid('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_format', 50)->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'project_id']);
        });

        Schema::create('model_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('model_id')->constrained('design_models')->cascadeOnDelete();
            $table->string('scenario_name');
            $table->text('description')->nullable();
            $table->jsonb('parameters')->nullable();
            $table->jsonb('results')->nullable();
            $table->enum('status', ['queued', 'running', 'completed', 'failed'])->default('queued');
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignUuid('executed_by')->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['model_id', 'status']);
        });

        Schema::create('model_calibrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('model_id')->constrained('design_models')->cascadeOnDelete();
            $table->string('calibration_name');
            $table->date('calibration_date');
            $table->jsonb('field_measurements')->nullable();
            $table->jsonb('model_outputs')->nullable();
            $table->decimal('rmse', 10, 4)->nullable(); // Root Mean Square Error
            $table->decimal('correlation', 10, 4)->nullable();
            $table->text('notes')->nullable();
            $table->foreignUuid('calibrated_by')->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['model_id']);
        });

        Schema::create('handover_packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('package_no', 50)->index();
            $table->date('commissioning_date');
            $table->date('handover_date')->nullable();
            $table->enum('status', ['pending', 'submitted', 'under_review', 'accepted', 'rejected'])->default('pending');
            $table->text('scope')->nullable();
            $table->jsonb('documents')->nullable(); // As-builts, O&M manuals
            $table->jsonb('spares')->nullable(); // List of spare parts
            $table->jsonb('warranties')->nullable(); // Warranty details with expiry
            $table->text('acceptance_notes')->nullable();
            $table->foreignUuid('submitted_by')->constrained('users')->nullOnDelete();
            $table->foreignUuid('accepted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'package_no']);
            $table->index(['tenant_id', 'status']);
            $table->index(['project_id']);
        });

        Schema::create('capitalization_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignUuid('handover_package_id')->nullable()->constrained('handover_packages')->nullOnDelete();
            $table->string('entry_no', 50)->index();
            $table->string('asset_class');
            $table->decimal('amount', 20, 2);
            $table->enum('depreciation_method', ['straight_line', 'declining_balance', 'units_of_production'])->default('straight_line');
            $table->integer('useful_life_years');
            $table->decimal('salvage_value', 20, 2)->nullable();
            $table->date('capitalization_date');
            $table->foreignId('gl_account_id')->nullable()->constrained('gl_accounts')->nullOnDelete();
            $table->unsignedBigInteger('linked_asset_id')->nullable();
            $table->enum('status', ['draft', 'posted', 'reversed'])->default('draft');
            $table->foreignUuid('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'entry_no']);
            $table->index(['tenant_id', 'status']);
            $table->index(['project_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capitalization_entries');
        Schema::dropIfExists('handover_packages');
        Schema::dropIfExists('model_calibrations');
        Schema::dropIfExists('model_runs');
        Schema::dropIfExists('design_models');
    }
};
