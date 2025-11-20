<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Spatial Edit Layers - track versions of spatial features
        Schema::create('spatial_edit_layers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('name'); // "Pipe Rehabilitation 2025", "DMA Boundary Update"
            $table->string('layer_type'); // schemes, dmas, facilities, pipelines, network_nodes, network_edges
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft/under_review/approved/rejected/archived
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->uuid('reviewed_by')->nullable();
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
            $table->uuid('approved_by')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->jsonb('metadata')->nullable(); // Submitter notes, GPS accuracy, etc.
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['layer_type', 'status']);
        });

        // Redlines - field edits (create, update, delete operations)
        Schema::create('redlines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreignUuid('edit_layer_id')->constrained('spatial_edit_layers')->cascadeOnDelete();
            $table->string('entity_type'); // schemes, pipelines, facilities, etc.
            $table->uuid('entity_id')->nullable(); // NULL for new features
            $table->enum('operation', ['create', 'update', 'delete'])->default('create');
            $table->jsonb('attributes_before')->nullable(); // Original attributes (for updates/deletes)
            $table->jsonb('attributes_after')->nullable(); // New/modified attributes
            $table->uuid('captured_by');
            $table->foreign('captured_by')->references('id')->on('users')->onDelete('restrict');
            $table->timestamp('captured_at');
            $table->string('capture_method')->nullable(); // mobile_app/web_gis/survey/gps_device
            $table->decimal('gps_accuracy_m', 8, 2)->nullable();
            $table->jsonb('evidence')->nullable(); // Photos, signatures, measurements
            $table->text('field_notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'entity_type']);
            $table->index(['edit_layer_id', 'operation']);
            $table->index(['entity_type', 'entity_id']);
        });

        // Add PostGIS columns for before/after geometries
        DB::statement('ALTER TABLE redlines ADD COLUMN geom_before geometry(Geometry,4326)');
        DB::statement('ALTER TABLE redlines ADD COLUMN geom_after geometry(Geometry,4326)');
        DB::statement('CREATE INDEX redlines_geom_before_idx ON redlines USING GIST (geom_before)');
        DB::statement('CREATE INDEX redlines_geom_after_idx ON redlines USING GIST (geom_after)');

        // Topology Validation Results - track QC checks on spatial data
        Schema::create('topology_validations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreignUuid('edit_layer_id')->nullable()->constrained('spatial_edit_layers')->nullOnDelete();
            $table->string('validation_type'); // dangling_nodes/overlapping_pipes/disconnected_segments/duplicate_features
            $table->string('severity'); // error/warning/info
            $table->string('entity_type'); // pipelines, network_nodes, etc.
            $table->uuid('entity_id')->nullable();
            $table->text('message');
            $table->jsonb('details')->nullable(); // Affected features, suggested fixes
            $table->boolean('resolved')->default(false);
            $table->uuid('resolved_by')->nullable();
            $table->foreign('resolved_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'severity', 'resolved']);
            $table->index(['entity_type', 'entity_id']);
        });

        DB::statement('ALTER TABLE topology_validations ADD COLUMN location geometry(Point,4326)');
        DB::statement('CREATE INDEX topology_validations_location_idx ON topology_validations USING GIST (location)');

        // Spatial Change Log - audit trail for all spatial edits
        Schema::create('spatial_change_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('entity_type');
            $table->uuid('entity_id');
            $table->string('action'); // created/updated/deleted/approved/rejected
            $table->jsonb('changes')->nullable(); // Field-level diff
            $table->uuid('changed_by');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('restrict');
            $table->string('change_source')->nullable(); // web/mobile/api/import
            $table->uuid('redline_id')->nullable();
            $table->foreign('redline_id')->references('id')->on('redlines')->onDelete('set null');
            $table->timestamps();

            $table->index(['tenant_id', 'entity_type', 'entity_id']);
            $table->index(['changed_by', 'created_at']);
        });

        // Map Layers Configuration - user-defined layer styling and visibility
        Schema::create('map_layer_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('layer_name'); // schemes, pipelines, facilities, etc.
            $table->string('display_name');
            $table->boolean('is_visible')->default(true);
            $table->integer('z_index')->default(0);
            $table->jsonb('style_rules')->nullable(); // MapLibre style spec
            $table->jsonb('filters')->nullable(); // Default filters
            $table->string('tile_endpoint')->nullable(); // MVT endpoint URL
            $table->integer('min_zoom')->default(0);
            $table->integer('max_zoom')->default(22);
            $table->timestamps();

            $table->unique(['tenant_id', 'layer_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('map_layer_configs');
        Schema::dropIfExists('spatial_change_log');
        Schema::dropIfExists('topology_validations');
        Schema::dropIfExists('redlines');
        Schema::dropIfExists('spatial_edit_layers');
    }
};
