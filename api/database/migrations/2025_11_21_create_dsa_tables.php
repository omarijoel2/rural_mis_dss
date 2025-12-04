<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Forecast Jobs - Time-series forecasting orchestration
        Schema::create('forecast_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('entity_type'); // 'scheme', 'dma', 'meter_class', 'customer_segment'
            $table->string('entity_id');
            $table->string('metric'); // 'production', 'demand', 'revenue', 'chemicals', 'energy_cost'
            $table->integer('horizon_days'); // Forecast horizon
            $table->string('model_family'); // 'arima', 'ets', 'prophet', 'lstm', 'auto'
            $table->jsonb('params')->nullable(); // Model hyperparameters
            $table->jsonb('features')->nullable(); // Exogenous variables (weather, holidays, etc.)
            $table->enum('status', ['pending', 'running', 'completed', 'failed'])->default('pending');
            $table->jsonb('scores')->nullable(); // MAE, RMSE, MAPE
            $table->string('outputs_key')->nullable(); // S3 key for forecast results
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['metric', 'model_family']);
        });

        // Scenarios - Stress tests and what-if planning
        Schema::create('scenarios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('name');
            $table->enum('type', ['drought', 'demand_spike', 'contamination', 'power_shock', 'asset_failure', 'custom']);
            $table->date('period_start');
            $table->date('period_end');
            $table->geometry('area_geom', 'polygon', 4326)->nullable(); // Affected area
            $table->jsonb('params'); // Severity, multipliers, affected assets
            $table->jsonb('playbook')->nullable(); // Action steps with owners/triggers
            $table->jsonb('results')->nullable(); // KPIs: deficit, continuity, costs
            $table->integer('monte_carlo_runs')->default(1);
            $table->enum('status', ['draft', 'running', 'completed'])->default('draft');
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'type']);
            $table->index(['scheme_id', 'status']);
            $table->spatialIndex('area_geom');
        });

        // Optimization Runs - Pump/valve/dosing/logistics optimization
        Schema::create('optim_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->enum('optim_type', ['pump_scheduling', 'valve_settings', 'chlorine_dosing', 'logistics']);
            $table->jsonb('scope'); // Assets, time window, demand targets
            $table->string('objective'); // 'minimize_energy_cost', 'minimize_nrw', 'maximize_residual'
            $table->jsonb('constraints'); // Hard/soft constraints with bounds
            $table->string('solver')->default('or-tools'); // 'or-tools', 'cbc', 'gurobi'
            $table->enum('status', ['pending', 'running', 'completed', 'failed'])->default('pending');
            $table->jsonb('kpis')->nullable(); // Savings, peak hours avoided, etc.
            $table->jsonb('outputs')->nullable(); // Schedule windows, setpoints, routes
            $table->string('outputs_key')->nullable(); // S3 key for detailed results
            $table->boolean('published')->default(false); // Published to CoreOps
            $table->timestamp('published_at')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'optim_type']);
            $table->index(['scheme_id', 'status']);
            $table->index(['created_at', 'published']);
        });

        // Anomalies - ML-based anomaly detection results
        Schema::create('anomalies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('source_type'); // 'telemetry_tag', 'meter', 'dma'
            $table->string('source_id');
            $table->string('signal'); // 'flow', 'pressure', 'consumption', 'quality'
            $table->timestampTz('ts'); // Anomaly timestamp
            $table->float('score'); // 0-1 anomaly score
            $table->string('pattern')->nullable(); // 'spike', 'drop', 'drift', 'stuck'
            $table->string('detector')->nullable(); // 'isolation_forest', 'lstm_ae', 'z_score'
            $table->jsonb('evidence'); // Raw values, thresholds, context
            $table->jsonb('triage')->nullable(); // Suspected cause, suggested action
            $table->enum('status', ['new', 'acknowledged', 'investigating', 'resolved', 'false_positive'])->default('new');
            $table->foreignUuid('acknowledged_by')->nullable()->constrained('users');
            $table->timestamp('acknowledged_at')->nullable();
            $table->unsignedBigInteger('work_order_id')->nullable();
            $table->foreign('work_order_id')->references('id')->on('work_orders')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['source_type', 'source_id']);
            $table->index(['signal', 'score']);
            $table->index('ts');
        });

        // Tariff Scenarios - Tariff simulations for equity analysis
        Schema::create('tariff_scenarios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('name');
            $table->string('base_tariff_id')->nullable(); // Reference to current tariff
            $table->jsonb('definition'); // Blocks, rates, fixed charges, lifeline
            $table->jsonb('segment_weights')->nullable(); // Customer segments distribution
            $table->jsonb('elasticity')->nullable(); // Demand response assumptions
            $table->jsonb('results')->nullable(); // Revenue, affordability by quintile, equity metrics
            $table->enum('status', ['draft', 'simulated', 'approved'])->default('draft');
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index('scheme_id');
        });

        // EWS Rules - Early Warning System threshold rules
        Schema::create('ews_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->jsonb('signals'); // Array of signal conditions (tag, operator, threshold)
            $table->jsonb('logic'); // AND/OR logic between signals
            $table->enum('priority', ['critical', 'high', 'medium', 'low'])->default('medium');
            $table->jsonb('actions'); // Alert channels, escalation chain, advisories
            $table->boolean('enabled')->default(true);
            $table->integer('quiet_hours_start')->nullable(); // 0-23
            $table->integer('quiet_hours_end')->nullable();
            $table->integer('hysteresis_minutes')->default(5); // Delay before re-alerting
            $table->jsonb('backtest_results')->nullable(); // Historical hit rate
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'enabled']);
            $table->index('scheme_id');
            $table->index('priority');
        });

        // EWS Alerts - Triggered early warning alerts
        Schema::create('ews_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('ews_rule_id')->constrained('ews_rules')->cascadeOnDelete();
            $table->enum('status', ['new', 'acknowledged', 'resolved', 'escalated'])->default('new');
            $table->jsonb('trigger_values'); // Signal values that triggered the rule
            $table->jsonb('meta')->nullable(); // Additional context
            $table->geometry('affected_area', 'polygon', 4326)->nullable();
            $table->foreignUuid('acknowledged_by')->nullable()->constrained('users');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->integer('response_time_minutes')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['ews_rule_id', 'created_at']);
            $table->index('acknowledged_at');
            $table->spatialIndex('affected_area');
        });

        // Hydrogeological KPIs - Aquifer and wellfield analytics
        Schema::create('hydro_kpis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('aquifer_name');
            $table->date('as_of');
            $table->float('recharge_mm')->nullable(); // Annual recharge estimate
            $table->float('abstraction_m3d')->nullable(); // Daily abstraction
            $table->float('storage_index')->nullable(); // 0-1 storage level
            $table->float('risk_score')->nullable(); // 0-1 saline intrusion/depletion risk
            $table->jsonb('wellfield_data')->nullable(); // Per-well metrics
            $table->timestamps();
            
            $table->unique(['tenant_id', 'scheme_id', 'aquifer_name', 'as_of']);
            $table->index('as_of');
        });

        // Model Registry - MLOps tracking for forecasts and ML models
        Schema::create('model_registry', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('version');
            $table->string('model_type'); // 'forecast', 'anomaly_detector', 'optimizer'
            $table->jsonb('metadata'); // Data windows, features, hyperparameters
            $table->jsonb('performance_metrics'); // Validation scores
            $table->string('artifact_key')->nullable(); // S3 key for model binary
            $table->enum('status', ['development', 'staging', 'production', 'archived'])->default('development');
            $table->timestamp('promoted_at')->nullable();
            $table->foreignUuid('promoted_by')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->unique(['tenant_id', 'name', 'version']);
            $table->index(['model_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('model_registry');
        Schema::dropIfExists('hydro_kpis');
        Schema::dropIfExists('ews_alerts');
        Schema::dropIfExists('ews_rules');
        Schema::dropIfExists('tariff_scenarios');
        Schema::dropIfExists('anomalies');
        Schema::dropIfExists('optim_runs');
        Schema::dropIfExists('scenarios');
        Schema::dropIfExists('forecast_jobs');
    }
};
