<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Condition Tags (sensor signals from SCADA/telemetry)
        Schema::create('condition_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->string('tag'); // sensor identifier
            $table->string('parameter'); // vibration, temperature, current_draw, pressure, flow_rate
            $table->string('unit'); // mm/s, °C, A, bar, m³/h
            $table->jsonb('thresholds'); // {lo_lo: -10, lo: 0, hi: 80, hi_hi: 100}
            $table->decimal('last_value', 12, 4)->nullable();
            $table->timestampTz('last_reading_at')->nullable();
            $table->enum('health_status', ['normal', 'warning', 'alarm', 'critical'])->default('normal');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('tag');
            $table->index('health_status');
        });

        // Condition Alarms
        Schema::create('condition_alarms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tag_id')->constrained('condition_tags')->onDelete('cascade');
            $table->enum('severity', ['lo_lo', 'lo', 'hi', 'hi_hi'])->default('hi');
            $table->decimal('value', 12, 4);
            $table->decimal('threshold', 12, 4);
            $table->enum('state', ['raised', 'acknowledged', 'cleared'])->default('raised');
            $table->timestampTz('raised_at');
            $table->timestampTz('acknowledged_at')->nullable();
            $table->uuid('acknowledged_by')->nullable();
            $table->foreign('acknowledged_by')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('cleared_at')->nullable();
            $table->text('ack_notes')->nullable();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->timestamps();
            
            $table->index('tag_id');
            $table->index('state');
            $table->index('raised_at');
        });

        // Asset Health Scores (0-100 calculated from multiple factors)
        Schema::create('asset_health_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->date('score_date');
            $table->decimal('overall_score', 5, 2); // 0-100
            $table->decimal('condition_score', 5, 2)->nullable();
            $table->decimal('reliability_score', 5, 2)->nullable();
            $table->decimal('age_score', 5, 2)->nullable();
            $table->integer('mtbf_days')->nullable(); // Mean Time Between Failures
            $table->integer('rul_days')->nullable(); // Remaining Useful Life
            $table->jsonb('factors')->nullable(); // Details of calculation
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('score_date');
            $table->index('overall_score');
        });

        // Predictive Rules (threshold breach → auto-create WO)
        Schema::create('predictive_rules', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('asset_class_id')->nullable()->constrained('asset_classes')->onDelete('cascade');
            $table->jsonb('conditions'); // [{tag_parameter: 'vibration', operator: '>', value: 10, duration_minutes: 30}]
            $table->foreignId('job_plan_id')->nullable()->constrained('job_plans')->onDelete('set null');
            $table->enum('wo_priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('asset_class_id');
            $table->index('is_active');
        });

        // Predictive WO Triggers (log when rule fires)
        Schema::create('predictive_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rule_id')->constrained('predictive_rules')->onDelete('cascade');
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->jsonb('condition_snapshot'); // Values that triggered the rule
            $table->timestampTz('triggered_at');
            $table->enum('status', ['wo_created', 'wo_exists', 'suppressed'])->default('wo_created');
            $table->timestamps();
            
            $table->index('rule_id');
            $table->index('asset_id');
            $table->index('triggered_at');
        });

        // Condition Readings History (time-series data - optional if using external TSDB)
        Schema::create('condition_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tag_id')->constrained('condition_tags')->onDelete('cascade');
            $table->timestampTz('reading_at');
            $table->decimal('value', 12, 4);
            $table->string('source')->default('scada'); // scada, manual, calculated
            $table->jsonb('metadata')->nullable();
            
            $table->index('tag_id');
            $table->index('reading_at');
        });
        // Partition by reading_at for performance (manual partitioning setup required)
    }

    public function down(): void
    {
        Schema::dropIfExists('condition_readings');
        Schema::dropIfExists('predictive_triggers');
        Schema::dropIfExists('predictive_rules');
        Schema::dropIfExists('asset_health_scores');
        Schema::dropIfExists('condition_alarms');
        Schema::dropIfExists('condition_tags');
    }
};
