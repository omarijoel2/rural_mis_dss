<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Network nodes - sources, junctions, treatment plants, reservoirs, customer connections
        Schema::create('network_nodes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->foreignUuid('dma_id')->nullable()->constrained('dmas')->nullOnDelete();
            $table->foreignUuid('facility_id')->nullable()->constrained('facilities')->nullOnDelete();
            $table->string('code', 32);
            $table->string('name')->nullable();
            $table->enum('type', ['source', 'wtp', 'reservoir', 'junction', 'customer_node', 'valve', 'pump'])->default('junction');
            $table->decimal('elevation_m', 8, 2)->nullable();
            $table->decimal('pressure_bar', 6, 2)->nullable();
            $table->jsonb('props')->nullable(); // Flexible properties (capacity, demand, etc.)
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'code']);
            $table->index(['scheme_id', 'type']);
        });
        
        DB::statement('ALTER TABLE network_nodes ADD COLUMN geom geometry(Point,4326)');
        DB::statement('CREATE INDEX network_nodes_geom_idx ON network_nodes USING GIST (geom)');

        // Network edges - pipes, valve connections, pump links
        Schema::create('network_edges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->foreignUuid('dma_id')->nullable()->constrained('dmas')->nullOnDelete();
            $table->foreignUuid('from_node_id')->constrained('network_nodes')->cascadeOnDelete();
            $table->foreignUuid('to_node_id')->constrained('network_nodes')->cascadeOnDelete();
            $table->string('code', 32)->nullable();
            $table->enum('type', ['pipe', 'valve', 'pump_link'])->default('pipe');
            $table->enum('material', ['uPVC', 'HDPE', 'DI', 'AC', 'GI', 'Steel', 'Other'])->nullable();
            $table->integer('diameter_mm')->nullable();
            $table->decimal('length_m', 10, 2)->nullable();
            $table->integer('install_year')->nullable();
            $table->enum('status', ['active', 'inactive', 'abandoned'])->default('active');
            $table->jsonb('props')->nullable(); // Roughness, capacity, etc.
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['scheme_id', 'type']);
            $table->index(['from_node_id', 'to_node_id']);
        });
        
        DB::statement('ALTER TABLE network_edges ADD COLUMN geom geometry(LineString,4326)');
        DB::statement('CREATE INDEX network_edges_geom_idx ON network_edges USING GIST (geom)');
    }

    public function down(): void
    {
        Schema::dropIfExists('network_edges');
        Schema::dropIfExists('network_nodes');
    }
};
