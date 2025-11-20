<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Outages - planned and unplanned service interruptions
        Schema::create('outages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->foreignUuid('dma_id')->nullable()->constrained('dmas')->nullOnDelete();
            $table->string('code', 32)->nullable();
            $table->enum('cause', ['planned', 'fault', 'water_quality', 'power', 'other'])->default('planned');
            $table->enum('state', ['draft', 'approved', 'live', 'restored', 'post_mortem', 'closed'])->default('draft');
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at')->nullable();
            $table->timestampTz('actual_restored_at')->nullable();
            $table->integer('estimated_customers_affected')->nullable();
            $table->integer('actual_customers_affected')->nullable();
            $table->jsonb('affected_stats')->nullable(); // facilities list, institutions, etc.
            $table->jsonb('notifications')->nullable(); // SMS/email channels, templates used
            $table->jsonb('isolation_plan')->nullable(); // Valve IDs to close
            $table->text('summary')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'scheme_id', 'state']);
            $table->index(['starts_at', 'ends_at']);
        });
        
        DB::statement('ALTER TABLE outages ADD COLUMN affected_geom geometry(MultiPolygon,4326)');
        DB::statement('CREATE INDEX outages_affected_geom_idx ON outages USING GIST (affected_geom)');

        // Outage audits - state change history
        Schema::create('outage_audits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('outage_id')->constrained('outages')->cascadeOnDelete();
            $table->string('event'); // approved, went_live, restored, closed
            $table->jsonb('meta')->nullable(); // Additional context
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['outage_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outage_audits');
        Schema::dropIfExists('outages');
    }
};
