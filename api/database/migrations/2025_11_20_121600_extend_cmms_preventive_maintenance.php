<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // PM Templates (vs simple policies - advanced with usage-based triggers)
        Schema::create('pm_templates', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreignId('asset_class_id')->constrained('asset_classes')->onDelete('cascade');
            $table->foreignId('job_plan_id')->nullable()->constrained('job_plans')->onDelete('set null');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('trigger_type', ['time_based', 'usage_based', 'combined'])->default('time_based');
            
            // Time-based
            $table->integer('frequency_days')->nullable();
            $table->integer('tolerance_days')->nullable(); // +/- window
            
            // Usage-based
            $table->jsonb('usage_counters')->nullable(); // [{meter_type: 'runtime_hours', threshold: 500, tolerance_pct: 10}]
            
            $table->boolean('is_active')->default(true);
            $table->jsonb('checklist')->nullable();
            $table->jsonb('kit')->nullable(); // Parts required
            $table->date('next_gen_date')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('asset_class_id');
            $table->index('is_active');
            $table->index('next_gen_date');
        });

        // PM Generation Log (audit trail of auto-generated WOs)
        Schema::create('pm_generation_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pm_template_id')->constrained('pm_templates')->onDelete('cascade');
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->date('scheduled_date');
            $table->enum('status', ['generated', 'deferred', 'skipped', 'completed'])->default('generated');
            $table->text('notes')->nullable();
            $table->timestampTz('generated_at');
            $table->timestamps();
            
            $table->index('pm_template_id');
            $table->index('asset_id');
            $table->index('scheduled_date');
            $table->index('status');
        });

        // PM Deferrals (track when PM is postponed)
        Schema::create('pm_deferrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pm_generation_log_id')->constrained('pm_generation_log')->onDelete('cascade');
            $table->date('original_date');
            $table->date('deferred_to');
            $table->string('reason_code'); // resource_unavailable, parts_shortage, operational_priority, weather
            $table->text('notes')->nullable();
            $table->uuid('deferred_by');
            $table->foreign('deferred_by')->references('id')->on('users')->onDelete('restrict');
            $table->uuid('approved_by')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('deferred_at');
            $table->timestamps();
            
            $table->index('pm_generation_log_id');
            $table->index('reason_code');
        });

        // PM Compliance Metrics (snapshot by period)
        Schema::create('pm_compliance_metrics', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('pm_scheduled')->default(0);
            $table->integer('pm_completed_on_time')->default(0);
            $table->integer('pm_completed_late')->default(0);
            $table->integer('pm_deferred')->default(0);
            $table->integer('pm_skipped')->default(0);
            $table->integer('breakdown_wo')->default(0); // Corrective maintenance count
            $table->decimal('compliance_pct', 5, 2)->nullable(); // on_time / scheduled
            $table->decimal('pm_breakdown_ratio', 8, 4)->nullable(); // pm_completed / breakdown_wo
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index(['period_start', 'period_end']);
        });

        // Calendar exceptions (holidays, shutdowns where PM shouldn't be scheduled)
        Schema::create('pm_calendar_exceptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->date('exception_date');
            $table->string('reason'); // holiday, shutdown, maintenance_window
            $table->boolean('recurring')->default(false);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('exception_date');
        });

        // PM Route Optimization (group PMs by location/crew)
        Schema::create('pm_routes', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('name');
            $table->uuid('scheme_id')->nullable();
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->uuid('assigned_crew')->nullable();
            $table->foreign('assigned_crew')->references('id')->on('users')->onDelete('set null');
            $table->jsonb('asset_sequence')->nullable(); // [asset_id, asset_id, ...] in visit order
            $table->decimal('estimated_hours', 8, 2)->nullable();
            $table->date('scheduled_date')->nullable();
            $table->enum('status', ['planned', 'in_progress', 'completed'])->default('planned');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('scheme_id');
            $table->index('scheduled_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pm_routes');
        Schema::dropIfExists('pm_calendar_exceptions');
        Schema::dropIfExists('pm_compliance_metrics');
        Schema::dropIfExists('pm_deferrals');
        Schema::dropIfExists('pm_generation_log');
        Schema::dropIfExists('pm_templates');
    }
};
