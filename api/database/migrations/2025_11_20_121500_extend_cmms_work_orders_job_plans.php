<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SLA Policies (create this first before referencing in work_orders)
        Schema::create('sla_policies', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('name');
            $table->enum('wo_type', ['pm', 'cm', 'emergency', 'project'])->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->nullable();
            $table->enum('asset_criticality', ['low', 'medium', 'high'])->nullable();
            $table->integer('response_minutes')->nullable(); // Time to assign
            $table->integer('resolution_minutes')->nullable(); // Time to complete
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('wo_type');
            $table->index('is_active');
        });

        // Job Plans (SOPs, checklists, required tools, labor, spares, risks)
        Schema::create('job_plans', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('asset_class_id')->nullable()->constrained('asset_classes')->onDelete('set null');
            $table->integer('version')->default(1);
            $table->enum('status', ['draft', 'active', 'archived'])->default('active');
            $table->text('sop')->nullable(); // Standard Operating Procedure
            $table->jsonb('checklist')->nullable(); // [{step, pass/fail, notes, required_photo}]
            $table->jsonb('required_tools')->nullable(); // [{tool, qty}]
            $table->jsonb('labor_roles')->nullable(); // [{role, hours_estimate, rate}]
            $table->jsonb('required_parts')->nullable(); // [{part_id, qty}]
            $table->text('risk_notes')->nullable();
            $table->string('permit_type')->nullable(); // hot_work, confined_space, loto, working_at_height
            $table->decimal('estimated_hours', 8, 2)->nullable();
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('asset_class_id');
            $table->index('status');
            $table->index('code');
        });

        // Enhance work_orders table - add missing columns
        Schema::table('work_orders', function (Blueprint $table) {
            $table->foreignId('job_plan_id')->nullable()->after('pm_policy_id')->constrained('job_plans')->onDelete('set null');
            $table->uuid('scheme_id')->nullable()->after('asset_id');
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->uuid('dma_id')->nullable()->after('scheme_id');
            $table->foreign('dma_id')->references('id')->on('dmas')->onDelete('set null');
            $table->foreignId('sla_policy_id')->nullable()->after('job_plan_id')->constrained('sla_policies')->onDelete('set null');
            $table->timestampTz('due_at')->nullable()->after('scheduled_for');
            $table->timestampTz('qa_at')->nullable()->after('completed_at');
            $table->uuid('qa_by')->nullable()->after('qa_at');
            $table->foreign('qa_by')->references('id')->on('users')->onDelete('set null');
            $table->decimal('est_labor_hours', 8, 2)->nullable()->after('completion_notes');
            $table->decimal('est_parts_cost', 12, 2)->nullable()->after('est_labor_hours');
            $table->decimal('actual_labor_hours', 8, 2)->nullable()->after('est_parts_cost');
            $table->decimal('actual_parts_cost', 12, 2)->nullable()->after('actual_labor_hours');
            $table->decimal('actual_external_cost', 12, 2)->nullable()->after('actual_parts_cost');
            $table->text('variance_notes')->nullable()->after('actual_external_cost');
        });

        // Update work_orders status enum to match spec lifecycle
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::table('work_orders', function (Blueprint $table) {
            $table->enum('status', ['draft', 'approved', 'assigned', 'in_progress', 'qa', 'completed', 'cancelled'])->default('draft')->after('priority');
        });

        // WO Attachments
        Schema::create('wo_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('type'); // photo, video, drawing, telemetry_trace, redline, document
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->integer('file_size')->nullable();
            $table->text('caption')->nullable();
            $table->uuid('uploaded_by');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('type');
        });

        // WO Checklist Items (from job plan)
        Schema::create('wo_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->integer('seq')->default(0);
            $table->string('step');
            $table->enum('result', ['pass', 'fail', 'na', 'pending'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->uuid('completed_by')->nullable();
            $table->foreign('completed_by')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('completed_at')->nullable();
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('result');
        });

        // WO Status Transitions (audit trail)
        Schema::create('wo_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('from_status');
            $table->string('to_status');
            $table->uuid('transitioned_by');
            $table->foreign('transitioned_by')->references('id')->on('users')->onDelete('restrict');
            $table->text('notes')->nullable();
            $table->timestampTz('transitioned_at');
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('transitioned_at');
        });

        // WO Comments
        Schema::create('wo_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->text('comment');
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('user_id');
        });

        // WO Assignments (for multi-technician assignments)
        Schema::create('wo_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->enum('role', ['primary', 'secondary', 'supervisor', 'observer'])->default('primary');
            $table->timestampTz('assigned_at');
            $table->uuid('assigned_by');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('user_id');
            $table->unique(['work_order_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wo_assignments');
        Schema::dropIfExists('wo_comments');
        Schema::dropIfExists('wo_transitions');
        Schema::dropIfExists('wo_checklist_items');
        Schema::dropIfExists('wo_attachments');
        Schema::dropIfExists('sla_policies');
        
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropForeign(['job_plan_id']);
            $table->dropForeign(['scheme_id']);
            $table->dropForeign(['dma_id']);
            $table->dropForeign(['sla_policy_id']);
            $table->dropForeign(['qa_by']);
            $table->dropColumn([
                'job_plan_id', 'scheme_id', 'dma_id', 'sla_policy_id',
                'due_at', 'qa_at', 'qa_by',
                'est_labor_hours', 'est_parts_cost',
                'actual_labor_hours', 'actual_parts_cost', 'actual_external_cost',
                'variance_notes'
            ]);
        });
        
        Schema::dropIfExists('job_plans');
    }
};
