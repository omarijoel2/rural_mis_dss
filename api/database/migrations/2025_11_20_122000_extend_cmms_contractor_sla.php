<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Service/Maintenance Framework Contracts (renamed to avoid collision with capital projects contracts)
        Schema::create('service_contracts', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('contract_num', 50)->unique();
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('restrict');
            $table->string('title');
            $table->text('scope')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('contract_value', 15, 2)->nullable();
            $table->enum('contract_type', ['labor', 'maintenance', 'supply', 'mixed'])->default('maintenance');
            $table->jsonb('rates')->nullable(); // {hourly: 50, daily: 400, parts_markup: 15%}
            $table->jsonb('kpis')->nullable(); // [{metric: 'response_time', target: 2, unit: 'hours'}]
            $table->decimal('penalty_rate', 8, 2)->nullable(); // % per breach
            $table->decimal('bonus_rate', 8, 2)->nullable(); // % for exceeding targets
            $table->enum('status', ['draft', 'active', 'expired', 'terminated'])->default('draft');
            $table->string('document_path')->nullable();
            $table->uuid('owner_id')->nullable();
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('supplier_id');
            $table->index('status');
            $table->index('contract_num');
            $table->index(['start_date', 'end_date']);
        });

        // Vendor Scorecards (performance tracking)
        Schema::create('vendor_scorecards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_contract_id')->constrained('service_contracts')->onDelete('cascade');
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('wo_assigned')->default(0);
            $table->integer('wo_completed')->default(0);
            $table->integer('wo_on_time')->default(0);
            $table->integer('wo_late')->default(0);
            $table->decimal('avg_response_hours', 8, 2)->nullable();
            $table->decimal('avg_resolution_hours', 8, 2)->nullable();
            $table->decimal('sla_compliance_pct', 5, 2)->nullable();
            $table->decimal('quality_score', 5, 2)->nullable(); // 0-100 from QA checks
            $table->decimal('penalties_amount', 12, 2)->default(0);
            $table->decimal('bonuses_amount', 12, 2)->default(0);
            $table->enum('rating', ['poor', 'fair', 'good', 'excellent'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('service_contract_id');
            $table->index(['period_start', 'period_end']);
        });

        // SLA Breaches (log every violation)
        Schema::create('sla_breaches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->foreignId('sla_policy_id')->constrained('sla_policies')->onDelete('cascade');
            $table->foreignId('service_contract_id')->nullable()->constrained('service_contracts')->onDelete('set null');
            $table->enum('breach_type', ['response', 'resolution'])->default('response');
            $table->integer('target_minutes');
            $table->integer('actual_minutes');
            $table->integer('variance_minutes');
            $table->decimal('penalty_amount', 12, 2)->default(0);
            $table->text('reason')->nullable();
            $table->boolean('waived')->default(false);
            $table->uuid('waived_by')->nullable();
            $table->foreign('waived_by')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('breached_at');
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('sla_policy_id');
            $table->index('service_contract_id');
            $table->index('breach_type');
            $table->index('breached_at');
        });

        // Contractor Portal Access (optional - vendors can view their WOs)
        Schema::create('vendor_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->enum('role', ['viewer', 'technician', 'manager'])->default('viewer');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            
            $table->index('supplier_id');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_users');
        Schema::dropIfExists('sla_breaches');
        Schema::dropIfExists('vendor_scorecards');
        Schema::dropIfExists('service_contracts');
    }
};
