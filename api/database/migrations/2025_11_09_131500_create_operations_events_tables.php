<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->enum('source', ['scada', 'ami', 'nrw', 'energy', 'manual', 'webhook']);
            $table->string('external_id')->nullable();
            $table->uuid('facility_id')->nullable();
            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('set null');
            $table->uuid('scheme_id')->nullable();
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->uuid('dma_id')->nullable();
            $table->foreign('dma_id')->references('id')->on('dmas')->onDelete('set null');
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->timestampTz('detected_at');
            $table->timestampTz('acknowledged_at')->nullable();
            $table->timestampTz('resolved_at')->nullable();
            $table->enum('status', ['new', 'ack', 'in_progress', 'resolved', 'closed'])->default('new');
            $table->text('description')->nullable();
            $table->jsonb('attributes')->nullable();
            $table->geometry('location', 'point', 4326)->nullable();
            $table->string('correlation_key', 100)->nullable();
            $table->timestampTz('sla_due_at')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('facility_id');
            $table->index('scheme_id');
            $table->index('dma_id');
            $table->index(['status', 'severity', 'detected_at']);
            $table->index('correlation_key');
            $table->index('sla_due_at');
            $table->spatialIndex('location');
        });
        
        DB::statement('CREATE UNIQUE INDEX events_unique_external_id ON events (tenant_id, source, external_id) WHERE external_id IS NOT NULL');
        DB::statement("CREATE INDEX events_open_partial ON events (status, severity) WHERE status IN ('new', 'ack', 'in_progress')");

        Schema::create('event_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id');
            $table->timestamps();
            
            $table->index('event_id');
            $table->index(['entity_type', 'entity_id']);
            $table->unique(['event_id', 'entity_type', 'entity_id']);
        });

        Schema::create('playbooks', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('name');
            $table->string('for_category')->nullable();
            $table->string('for_severity')->nullable();
            $table->jsonb('steps');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('for_category');
            $table->index('for_severity');
        });

        Schema::create('event_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->string('action');
            $table->uuid('actor_id')->nullable();
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('set null');
            $table->jsonb('payload')->nullable();
            $table->timestampTz('occurred_at');
            $table->timestamps();
            
            $table->index('event_id');
            $table->index('actor_id');
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_actions');
        Schema::dropIfExists('playbooks');
        Schema::dropIfExists('event_links');
        Schema::dropIfExists('events');
    }
};
