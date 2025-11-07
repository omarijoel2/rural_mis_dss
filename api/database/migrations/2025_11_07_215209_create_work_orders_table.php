<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreignId('asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->string('title');
            $table->enum('type', ['pm', 'cm', 'inspection', 'project'])->default('cm');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['new', 'assigned', 'in_progress', 'on_hold', 'done', 'closed'])->default('new');
            $table->uuid('requester_id');
            $table->foreign('requester_id')->references('id')->on('users')->onDelete('restrict');
            $table->uuid('assignee_id')->nullable();
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
            $table->timestampTz('opened_at');
            $table->timestampTz('due_at')->nullable();
            $table->timestampTz('closed_at')->nullable();
            $table->geometry('location', 'point', 4326)->nullable();
            $table->text('description')->nullable();
            $table->jsonb('checklist')->nullable();
            $table->decimal('costs', 12, 2)->default(0);
            $table->enum('source', ['manual', 'nrw_anomaly', 'energy_alert', 'inspection', 'import'])->default('manual');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('asset_id');
            $table->index('status');
            $table->index('type');
            $table->index('priority');
            $table->index('assignee_id');
            $table->index(['status', 'due_at']);
            $table->spatialIndex('location');
        });
        
        DB::statement("CREATE INDEX work_orders_open_status_idx ON work_orders (status) WHERE status IN ('new', 'assigned', 'in_progress')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
