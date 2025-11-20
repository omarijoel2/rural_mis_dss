<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stores / Warehouses
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->uuid('scheme_id')->nullable();
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->text('address')->nullable();
            $table->uuid('manager_id')->nullable();
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
            $table->geometry('geom', 'point', 4326)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('scheme_id');
            $table->index('code');
            $table->spatialIndex('geom');
        });

        // Bins within stores
        Schema::create('bins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->string('code', 50);
            $table->string('location_desc')->nullable(); // Aisle-A, Shelf-3
            $table->timestamps();
            
            $table->index('store_id');
            $table->unique(['store_id', 'code']);
        });

        // Inventory Locations (parts in specific bins)
        Schema::create('inventory_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->foreignId('bin_id')->constrained('bins')->onDelete('cascade');
            $table->decimal('qty', 10, 4)->default(0);
            $table->timestamps();
            
            $table->index('part_id');
            $table->index('bin_id');
            $table->unique(['part_id', 'bin_id']);
        });

        // Parts - extend with inventory management fields
        Schema::table('parts', function (Blueprint $table) {
            $table->enum('valuation_method', ['fifo', 'weighted_avg', 'standard'])->default('weighted_avg')->after('cost');
            $table->decimal('avg_cost', 12, 2)->default(0)->after('cost');
            $table->integer('lead_time_days')->nullable()->after('reorder_qty');
            $table->boolean('requires_approval')->default(false)->after('lead_time_days');
            $table->decimal('max_qty', 10, 4)->nullable()->after('min_qty');
            $table->foreignId('primary_supplier_id')->nullable()->after('location')->constrained('suppliers')->onDelete('set null');
        });

        // Valuation History (track cost changes)
        Schema::create('inventory_valuation_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->date('effective_date');
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('avg_cost', 12, 2)->nullable();
            $table->decimal('qty_on_hand', 10, 4);
            $table->decimal('total_value', 15, 2);
            $table->string('source'); // purchase, adjustment, period_close
            $table->timestamps();
            
            $table->index('part_id');
            $table->index('effective_date');
        });

        // Kits (pre-defined parts bundles for WOs/PMs)
        Schema::create('kits', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('job_plan_id')->nullable()->constrained('job_plans')->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('code');
        });

        // Kit Items
        Schema::create('kit_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kit_id')->constrained('kits')->onDelete('cascade');
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->decimal('qty', 10, 4);
            $table->timestamps();
            
            $table->index('kit_id');
            $table->index('part_id');
            $table->unique(['kit_id', 'part_id']);
        });

        // Reorder Suggestions (auto-generated)
        Schema::create('reorder_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->decimal('current_qty', 10, 4);
            $table->decimal('min_qty', 10, 4);
            $table->decimal('suggested_order_qty', 10, 4);
            $table->decimal('demand_forecast', 10, 4)->nullable();
            $table->date('suggested_on');
            $table->enum('status', ['pending', 'approved', 'ordered', 'rejected'])->default('pending');
            $table->uuid('reviewed_by')->nullable();
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('part_id');
            $table->index('status');
            $table->index('suggested_on');
        });

        // Stock Turnover Analytics (snapshot by period)
        Schema::create('inventory_turnover', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('parts')->onDelete('cascade');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('opening_qty', 10, 4)->default(0);
            $table->decimal('closing_qty', 10, 4)->default(0);
            $table->decimal('total_issued', 10, 4)->default(0);
            $table->decimal('total_received', 10, 4)->default(0);
            $table->decimal('avg_qty', 10, 4)->default(0);
            $table->decimal('turnover_ratio', 8, 4)->nullable(); // issues / avg_qty
            $table->integer('days_on_hand')->nullable();
            $table->enum('classification', ['fast_moving', 'medium', 'slow_moving', 'dead_stock'])->nullable();
            $table->timestamps();
            
            $table->index('part_id');
            $table->index(['period_start', 'period_end']);
            $table->index('classification');
        });

        // Stock Txns - extend with approvals
        Schema::table('stock_txns', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('part_id')->constrained('stores')->onDelete('set null');
            $table->foreignId('bin_id')->nullable()->after('store_id')->constrained('bins')->onDelete('set null');
            $table->uuid('requested_by')->nullable()->after('work_order_id');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('set null');
            $table->uuid('approved_by')->nullable()->after('requested_by');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->enum('status', ['pending', 'approved', 'completed', 'rejected'])->default('completed')->after('kind');
            $table->text('notes')->nullable()->after('ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_turnover');
        Schema::dropIfExists('reorder_suggestions');
        Schema::dropIfExists('kit_items');
        Schema::dropIfExists('kits');
        Schema::dropIfExists('inventory_valuation_history');
        Schema::table('parts', function (Blueprint $table) {
            $table->dropForeign(['primary_supplier_id']);
            $table->dropColumn(['valuation_method', 'avg_cost', 'lead_time_days', 'requires_approval', 'max_qty', 'primary_supplier_id']);
        });
        Schema::dropIfExists('inventory_locations');
        Schema::dropIfExists('bins');
        Schema::dropIfExists('stores');
        
        Schema::table('stock_txns', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropForeign(['bin_id']);
            $table->dropForeign(['requested_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['store_id', 'bin_id', 'requested_by', 'approved_by', 'status', 'notes']);
        });
    }
};
