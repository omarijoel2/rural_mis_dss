<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_premises', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->uuid('scheme_id')->nullable();
            $table->uuid('dma_id')->nullable();
            $table->string('premise_id')->unique();
            $table->text('address')->nullable();
            $table->enum('occupancy', ['residential', 'commercial', 'institutional', 'mixed'])->default('residential');
            $table->enum('status', ['active', 'vacant', 'demolished'])->default('active');
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->foreign('scheme_id')->references('id')->on('schemes')->nullOnDelete();
            $table->foreign('dma_id')->references('id')->on('dmas')->nullOnDelete();
            
            $table->index('tenant_id');
            $table->index('scheme_id');
            $table->index('status');
        });

        // Add PostGIS geometry column
        DB::statement('ALTER TABLE crm_premises ADD COLUMN location geometry(Point, 4326)');
        DB::statement('CREATE INDEX crm_premises_location_gist ON crm_premises USING GIST(location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_premises');
    }
};
