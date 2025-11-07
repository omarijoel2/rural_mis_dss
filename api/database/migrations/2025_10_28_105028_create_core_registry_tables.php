<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Enable PostGIS extension if not already enabled
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
        
        // Tenants - multi-tenancy root
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('short_code', 32)->unique();
            $table->string('country', 2)->default('KE');
            $table->string('timezone')->default('Africa/Nairobi');
            $table->string('currency', 3)->default('KES');
            $table->string('logo_path')->nullable();
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Organizations - utilities, authorities, departments
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('org_code', 32);
            $table->string('name');
            $table->enum('type', ['authority', 'utility', 'department']);
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'org_code']);
        });
        
        DB::statement('ALTER TABLE organizations ADD COLUMN geom geometry(Polygon,4326)');
        DB::statement('CREATE INDEX organizations_geom_idx ON organizations USING GIST (geom)');

        // Schemes - water supply schemes
        Schema::create('schemes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('org_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('code', 32);
            $table->string('name');
            $table->enum('type', ['urban', 'rural', 'mixed'])->default('rural');
            $table->integer('population_estimate')->nullable();
            $table->enum('status', ['active', 'planning', 'decommissioned'])->default('active');
            $table->decimal('elevation_m', 8, 2)->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'code']);
        });
        
        DB::statement('ALTER TABLE schemes ADD COLUMN geom geometry(Polygon,4326)');
        DB::statement('ALTER TABLE schemes ADD COLUMN centroid geometry(Point,4326)');
        DB::statement('CREATE INDEX schemes_geom_idx ON schemes USING GIST (geom)');
        DB::statement('CREATE INDEX schemes_centroid_idx ON schemes USING GIST (centroid)');

        // Facilities - pumps, tanks, treatment plants, offices
        Schema::create('facilities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->string('code', 32);
            $table->string('name');
            $table->enum('category', ['source', 'treatment', 'pumpstation', 'reservoir', 'office', 'workshop', 'warehouse', 'lab']);
            $table->enum('status', ['active', 'standby', 'decommissioned'])->default('active');
            $table->text('address')->nullable();
            $table->date('commissioned_on')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'code']);
        });
        
        DB::statement('ALTER TABLE facilities ADD COLUMN location geometry(Point,4326)');
        DB::statement('CREATE INDEX facilities_location_idx ON facilities USING GIST (location)');

        // DMAs - District Metered Areas
        Schema::create('dmas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->string('code', 32);
            $table->string('name');
            $table->enum('status', ['active', 'planned', 'retired'])->default('active');
            $table->decimal('nightline_threshold_m3h', 10, 2)->nullable();
            $table->decimal('pressure_target_bar', 5, 2)->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'code']);
        });
        
        DB::statement('ALTER TABLE dmas ADD COLUMN geom geometry(Polygon,4326)');
        DB::statement('CREATE INDEX dmas_geom_idx ON dmas USING GIST (geom)');

        // Pipelines - network segments
        Schema::create('pipelines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->string('code', 32);
            $table->enum('material', ['uPVC', 'HDPE', 'DI', 'AC', 'GI', 'Steel', 'Other'])->default('uPVC');
            $table->integer('diameter_mm');
            $table->integer('install_year')->nullable();
            $table->enum('status', ['active', 'leak', 'rehab', 'abandoned'])->default('active');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'code']);
        });
        
        DB::statement('ALTER TABLE pipelines ADD COLUMN geom geometry(LineString,4326)');
        DB::statement('CREATE INDEX pipelines_geom_idx ON pipelines USING GIST (geom)');

        // Zones - administrative zones (wards, sub-counties, custom)
        Schema::create('zones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('type', 50);
            $table->string('code', 32);
            $table->string('name');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'code']);
        });
        
        DB::statement('ALTER TABLE zones ADD COLUMN geom geometry(Polygon,4326)');
        DB::statement('CREATE INDEX zones_geom_idx ON zones USING GIST (geom)');

        // Addresses - geocoded addresses
        Schema::create('addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('premise_code', 50)->nullable();
            $table->string('street')->nullable();
            $table->string('village')->nullable();
            $table->string('ward')->nullable();
            $table->string('subcounty')->nullable();
            $table->string('city')->nullable();
            $table->string('postcode', 20)->nullable();
            $table->string('country', 2)->default('KE');
            $table->string('what3words')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        
        DB::statement('ALTER TABLE addresses ADD COLUMN location geometry(Point,4326)');
        DB::statement('CREATE INDEX addresses_location_idx ON addresses USING GIST (location)');

        // Lookup values - materials, statuses, categories
        Schema::create('lookup_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('domain', 50);
            $table->string('code', 50);
            $table->string('label');
            $table->integer('order')->default(0);
            $table->boolean('active')->default(true);
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            
            $table->unique(['domain', 'code']);
        });

        // Attachments - files, photos, documents
        Schema::create('attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('entity_type');
            $table->uuid('entity_id');
            $table->string('path');
            $table->string('kind', 50)->nullable();
            $table->string('title')->nullable();
            $table->foreignId('uploaded_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('lookup_values');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('zones');
        Schema::dropIfExists('pipelines');
        Schema::dropIfExists('dmas');
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('schemes');
        Schema::dropIfExists('organizations');
        Schema::dropIfExists('tenants');
    }
};
