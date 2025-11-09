<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->uuid('facility_id')->nullable();
            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('set null');
            $table->uuid('scheme_id')->nullable();
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->uuid('dma_id')->nullable();
            $table->foreign('dma_id')->references('id')->on('dmas')->onDelete('set null');
            $table->string('name');
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->uuid('supervisor_id')->nullable();
            $table->foreign('supervisor_id')->references('id')->on('users')->onDelete('set null');
            $table->enum('status', ['planned', 'active', 'closed'])->default('planned');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('facility_id');
            $table->index('scheme_id');
            $table->index('dma_id');
            $table->index('supervisor_id');
            $table->index('status');
            $table->index(['starts_at', 'ends_at']);
        });

        Schema::create('shift_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->enum('kind', ['note', 'reading', 'checklist', 'handover']);
            $table->string('title');
            $table->text('body')->nullable();
            $table->jsonb('tags')->nullable();
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->geometry('geom', 'point', 4326)->nullable();
            $table->jsonb('attachments')->nullable();
            $table->timestamps();
            
            $table->index('shift_id');
            $table->index('kind');
            $table->index('created_by');
            $table->index('created_at');
            $table->spatialIndex('geom');
        });

        Schema::create('checklists', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('title');
            $table->jsonb('schema');
            $table->enum('frequency', ['hourly', 'daily', 'weekly', 'custom'])->default('daily');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('frequency');
        });

        Schema::create('checklist_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_id')->constrained('checklists')->onDelete('cascade');
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->onDelete('set null');
            $table->uuid('facility_id')->nullable();
            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('set null');
            $table->uuid('performed_by');
            $table->foreign('performed_by')->references('id')->on('users')->onDelete('cascade');
            $table->timestampTz('started_at');
            $table->timestampTz('completed_at')->nullable();
            $table->jsonb('data');
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamps();
            
            $table->index('checklist_id');
            $table->index('shift_id');
            $table->index('facility_id');
            $table->index('performed_by');
            $table->index(['started_at', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_runs');
        Schema::dropIfExists('checklists');
        Schema::dropIfExists('shift_entries');
        Schema::dropIfExists('shifts');
    }
};
