<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('source_kinds', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
        });

        Schema::create('source_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('color', 20)->nullable();
            $table->boolean('active')->default(true);
            $table->integer('sort_order')->default(0);
        });

        Schema::create('quality_risk_levels', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->string('color', 20)->nullable();
            $table->integer('sort_order')->default(0);
        });

        Schema::create('sources', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->foreignId('kind_id')->constrained('source_kinds');
            $table->foreignId('status_id')->constrained('source_statuses');
            $table->string('catchment')->nullable();
            $table->decimal('elevation_m', 10, 2)->nullable();
            $table->decimal('depth_m', 10, 2)->nullable();
            $table->decimal('static_level_m', 10, 2)->nullable();
            $table->decimal('dynamic_level_m', 10, 2)->nullable();
            $table->decimal('capacity_m3_per_day', 12, 2)->nullable()->check('capacity_m3_per_day >= 0');
            $table->string('permit_no')->nullable();
            $table->date('permit_expiry')->nullable();
            $table->foreignId('quality_risk_id')->nullable()->constrained('quality_risk_levels');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'scheme_id']);
            $table->index('code');
            $table->index('permit_expiry');
        });

        DB::statement('ALTER TABLE sources ADD COLUMN location geometry(Point, 4326)');
        DB::statement('CREATE INDEX sources_location_idx ON sources USING GIST (location)');

        Schema::create('abstraction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_id')->constrained('sources')->cascadeOnDelete();
            $table->foreignId('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->timestampTz('logged_at');
            $table->decimal('volume_m3', 12, 2)->check('volume_m3 >= 0');
            $table->string('method', 20);
            $table->string('quality', 20);
            $table->foreignId('logged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['source_id', 'logged_at']);
            $table->index('logged_at');
            $table->unique(['source_id', 'logged_at']);
        });

        DB::table('source_kinds')->insert([
            ['code' => 'borehole', 'name' => 'Borehole', 'description' => 'Groundwater borehole', 'sort_order' => 1],
            ['code' => 'river_intake', 'name' => 'River Intake', 'description' => 'Surface water intake from river', 'sort_order' => 2],
            ['code' => 'spring', 'name' => 'Spring', 'description' => 'Natural spring', 'sort_order' => 3],
            ['code' => 'dam', 'name' => 'Dam/Reservoir', 'description' => 'Dam or reservoir', 'sort_order' => 4],
            ['code' => 'lake', 'name' => 'Lake', 'description' => 'Lake water source', 'sort_order' => 5],
            ['code' => 'well', 'name' => 'Well', 'description' => 'Shallow well', 'sort_order' => 6],
        ]);

        DB::table('source_statuses')->insert([
            ['code' => 'active', 'name' => 'Active', 'color' => 'green', 'sort_order' => 1],
            ['code' => 'standby', 'name' => 'Standby', 'color' => 'blue', 'sort_order' => 2],
            ['code' => 'dry', 'name' => 'Dry', 'color' => 'red', 'sort_order' => 3],
            ['code' => 'abandoned', 'name' => 'Abandoned', 'color' => 'gray', 'sort_order' => 4],
            ['code' => 'under_construction', 'name' => 'Under Construction', 'color' => 'orange', 'sort_order' => 5],
        ]);

        DB::table('quality_risk_levels')->insert([
            ['code' => 'low', 'name' => 'Low Risk', 'color' => 'green', 'sort_order' => 1],
            ['code' => 'medium', 'name' => 'Medium Risk', 'color' => 'yellow', 'sort_order' => 2],
            ['code' => 'high', 'name' => 'High Risk', 'color' => 'red', 'sort_order' => 3],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('abstraction_logs');
        Schema::dropIfExists('sources');
        Schema::dropIfExists('quality_risk_levels');
        Schema::dropIfExists('source_statuses');
        Schema::dropIfExists('source_kinds');
    }
};
