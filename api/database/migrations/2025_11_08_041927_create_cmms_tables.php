<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_classes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->foreignId('parent_id')->nullable()->constrained('asset_classes')->onDelete('cascade');
            $table->enum('criticality', ['low', 'medium', 'high'])->default('medium');
            $table->jsonb('attributes_schema')->nullable();
            $table->timestamps();
            
            $table->index('parent_id');
            $table->index('code');
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->uuid('scheme_id')->nullable();
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->uuid('dma_id')->nullable();
            $table->foreign('dma_id')->references('id')->on('dmas')->onDelete('set null');
            $table->foreignId('class_id')->constrained('asset_classes')->onDelete('restrict');
            $table->foreignId('parent_id')->nullable()->constrained('assets')->onDelete('cascade');
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('barcode', 100)->nullable()->unique();
            $table->string('serial', 100)->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->enum('status', ['active', 'inactive', 'retired', 'under_maintenance'])->default('active');
            $table->date('install_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->geometry('geom', 'point', 4326)->nullable();
            $table->jsonb('specs')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('scheme_id');
            $table->index('dma_id');
            $table->index('class_id');
            $table->index('parent_id');
            $table->index('status');
            $table->index('code');
            $table->spatialIndex('geom');
        });

        Schema::create('asset_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->geometry('geom', 'point', 4326);
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index(['effective_from', 'effective_to']);
            $table->spatialIndex('geom');
        });

        Schema::create('asset_meters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->string('kind', 50);
            $table->string('unit', 20);
            $table->decimal('multiplier', 10, 4)->default(1.0);
            $table->timestamps();
            
            $table->index('asset_id');
        });

        Schema::create('meter_captures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_meter_id')->constrained('asset_meters')->onDelete('cascade');
            $table->timestampTz('captured_at');
            $table->decimal('value', 12, 4);
            $table->string('source', 50)->default('manual');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            
            $table->index('asset_meter_id');
            $table->index('captured_at');
        });

        Schema::create('parts', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('category', 100)->nullable();
            $table->string('unit', 50);
            $table->decimal('min_qty', 10, 4)->default(0);
            $table->decimal('reorder_qty', 10, 4)->default(0);
            $table->decimal('cost', 12, 2)->default(0);
            $table->string('location')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('code');
            $table->index('category');
        });

        Schema::create('asset_boms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->decimal('qty', 10, 4);
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('part_id');
            $table->unique(['asset_id', 'part_id']);
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('terms')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
        });

        Schema::create('pm_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->enum('strategy', ['time', 'meter', 'condition'])->default('time');
            $table->integer('interval_value')->nullable();
            $table->string('interval_unit', 20)->nullable();
            $table->string('task');
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('is_active');
        });

        Schema::create('pm_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pm_policy_id')->constrained('pm_policies')->onDelete('cascade');
            $table->timestampTz('next_due')->nullable();
            $table->timestampTz('last_done')->nullable();
            $table->enum('status', ['scheduled', 'overdue', 'completed', 'skipped'])->default('scheduled');
            $table->timestamps();
            
            $table->index('pm_policy_id');
            $table->index('next_due');
            $table->index('status');
        });

        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('wo_num', 50)->unique();
            $table->enum('kind', ['pm', 'cm', 'emergency', 'project'])->default('cm');
            $table->foreignId('asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['new', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'])->default('new');
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->uuid('assigned_to')->nullable();
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('scheduled_for')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->text('completion_notes')->nullable();
            $table->foreignId('pm_policy_id')->nullable()->constrained('pm_policies')->onDelete('set null');
            $table->geometry('geom', 'point', 4326)->nullable();
            $table->enum('source', ['manual', 'nrw_anomaly', 'energy_alert', 'inspection', 'pm_schedule'])->default('manual');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('asset_id');
            $table->index('status');
            $table->index('kind');
            $table->index('priority');
            $table->index('created_by');
            $table->index('assigned_to');
            $table->index('scheduled_for');
            $table->index('wo_num');
            $table->spatialIndex('geom');
        });

        DB::statement("CREATE INDEX work_orders_open_status_idx ON work_orders (status) WHERE status IN ('new', 'assigned', 'in_progress')");

        Schema::create('stock_txns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->enum('kind', ['receipt', 'issue', 'adjustment', 'transfer'])->default('receipt');
            $table->decimal('qty', 10, 4);
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->string('ref')->nullable();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->timestampTz('occurred_at');
            $table->timestamps();
            
            $table->index('part_id');
            $table->index('kind');
            $table->index('work_order_id');
            $table->index('occurred_at');
        });

        Schema::create('wo_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->decimal('qty', 10, 4);
            $table->decimal('unit_cost', 12, 2);
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('part_id');
        });

        Schema::create('wo_labor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->decimal('hours', 8, 2);
            $table->decimal('rate', 12, 2);
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('user_id');
        });

        Schema::create('failures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('code', 50)->nullable();
            $table->string('mode')->nullable();
            $table->string('cause')->nullable();
            $table->string('effect')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failures');
        Schema::dropIfExists('wo_labor');
        Schema::dropIfExists('wo_parts');
        Schema::dropIfExists('stock_txns');
        Schema::dropIfExists('work_orders');
        Schema::dropIfExists('pm_schedules');
        Schema::dropIfExists('pm_policies');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('asset_boms');
        Schema::dropIfExists('parts');
        Schema::dropIfExists('meter_captures');
        Schema::dropIfExists('asset_meters');
        Schema::dropIfExists('asset_locations');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('asset_classes');
    }
};
