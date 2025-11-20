<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Permits to Work
        Schema::create('permits', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('permit_num', 50)->unique();
            $table->enum('permit_type', ['hot_work', 'confined_space', 'loto', 'working_at_height', 'electrical', 'excavation'])->default('hot_work');
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->foreignId('asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->string('location');
            $table->text('work_description');
            $table->jsonb('hazards_identified')->nullable(); // [fire, toxic_gas, fall, electrical]
            $table->jsonb('control_measures')->nullable(); // [{hazard, control, responsible}]
            $table->uuid('requested_by');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('restrict');
            $table->uuid('approved_by')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('valid_from')->nullable();
            $table->timestampTz('valid_to')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'active', 'expired', 'cancelled'])->default('draft');
            $table->text('approval_notes')->nullable();
            $table->string('signature_path')->nullable(); // Digital signature image
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('work_order_id');
            $table->index('permit_type');
            $table->index('status');
            $table->index('permit_num');
            $table->index(['valid_from', 'valid_to']);
        });

        // Permit Approvals (multi-level approval workflow)
        Schema::create('permit_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permit_id')->constrained('permits')->onDelete('cascade');
            $table->integer('approval_level'); // 1, 2, 3 for multi-stage
            $table->string('approver_role'); // supervisor, hse_officer, manager
            $table->uuid('approver_id')->nullable();
            $table->foreign('approver_id')->references('id')->on('users')->onDelete('set null');
            $table->enum('decision', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('comments')->nullable();
            $table->timestampTz('decided_at')->nullable();
            $table->timestamps();
            
            $table->index('permit_id');
            $table->index('approver_id');
            $table->index('decision');
        });

        // Risk Assessments (JSA - Job Safety Analysis)
        Schema::create('risk_assessments', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('assessment_num', 50)->unique();
            $table->foreignId('job_plan_id')->nullable()->constrained('job_plans')->onDelete('set null');
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->string('activity');
            $table->jsonb('hazards')->nullable(); // [{hazard, consequence, likelihood, severity, initial_risk_level}]
            $table->jsonb('mitigations')->nullable(); // [{hazard, control_measure, responsible, residual_likelihood, residual_severity, residual_risk_level}]
            $table->enum('overall_risk', ['low', 'medium', 'high', 'extreme'])->nullable();
            $table->uuid('assessed_by');
            $table->foreign('assessed_by')->references('id')->on('users')->onDelete('restrict');
            $table->uuid('reviewed_by')->nullable();
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            $table->date('assessment_date');
            $table->date('review_date')->nullable();
            $table->enum('status', ['draft', 'active', 'archived'])->default('active');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('job_plan_id');
            $table->index('work_order_id');
            $table->index('status');
            $table->index('assessment_num');
        });

        // Incidents & Near-Miss
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('incident_num', 50)->unique();
            $table->enum('incident_type', ['injury', 'near_miss', 'property_damage', 'environmental', 'security'])->default('near_miss');
            $table->enum('severity', ['minor', 'moderate', 'serious', 'critical', 'fatal'])->default('minor');
            $table->timestampTz('occurred_at');
            $table->string('location');
            $table->foreignId('asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->text('description');
            $table->text('immediate_action_taken')->nullable();
            $table->jsonb('persons_involved')->nullable(); // [{name, role, injury_type}]
            $table->jsonb('witnesses')->nullable();
            $table->uuid('reported_by');
            $table->foreign('reported_by')->references('id')->on('users')->onDelete('restrict');
            $table->uuid('investigator_id')->nullable();
            $table->foreign('investigator_id')->references('id')->on('users')->onDelete('set null');
            $table->text('root_cause')->nullable();
            $table->text('contributing_factors')->nullable();
            $table->enum('status', ['reported', 'investigating', 'capa_pending', 'closed'])->default('reported');
            $table->boolean('lost_time_injury')->default(false);
            $table->integer('days_lost')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('incident_type');
            $table->index('severity');
            $table->index('status');
            $table->index('occurred_at');
            $table->index('incident_num');
        });

        // Corrective & Preventive Actions (CAPA)
        Schema::create('capas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->nullable()->constrained('incidents')->onDelete('cascade');
            $table->foreignId('risk_assessment_id')->nullable()->constrained('risk_assessments')->onDelete('set null');
            $table->string('capa_num', 50)->unique();
            $table->enum('capa_type', ['corrective', 'preventive'])->default('corrective');
            $table->text('action_description');
            $table->uuid('owner_id');
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('restrict');
            $table->date('due_date');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['open', 'in_progress', 'pending_verification', 'verified', 'closed'])->default('open');
            $table->text('implementation_notes')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->uuid('verified_by')->nullable();
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamps();
            
            $table->index('incident_id');
            $table->index('owner_id');
            $table->index('status');
            $table->index('due_date');
            $table->index('capa_num');
        });

        // HSE Training Records (who is certified for what)
        Schema::create('hse_training', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('training_type'); // confined_space, hot_work, first_aid, fire_fighting
            $table->string('certificate_num')->nullable();
            $table->date('completed_date');
            $table->date('expiry_date')->nullable();
            $table->string('training_provider')->nullable();
            $table->string('certificate_path')->nullable();
            $table->enum('status', ['valid', 'expired', 'expiring_soon'])->default('valid');
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('training_type');
            $table->index('expiry_date');
            $table->index('status');
        });

        // Add gate control to work_orders
        Schema::table('work_orders', function (Blueprint $table) {
            $table->boolean('requires_permit')->default(false)->after('source');
            $table->foreignId('permit_id')->nullable()->after('requires_permit')->constrained('permits')->onDelete('set null');
            $table->foreignId('risk_assessment_id')->nullable()->after('permit_id')->constrained('risk_assessments')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropForeign(['permit_id']);
            $table->dropForeign(['risk_assessment_id']);
            $table->dropColumn(['requires_permit', 'permit_id', 'risk_assessment_id']);
        });
        
        Schema::dropIfExists('hse_training');
        Schema::dropIfExists('capas');
        Schema::dropIfExists('incidents');
        Schema::dropIfExists('risk_assessments');
        Schema::dropIfExists('permit_approvals');
        Schema::dropIfExists('permits');
    }
};
