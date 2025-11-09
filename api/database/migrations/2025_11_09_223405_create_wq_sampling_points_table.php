<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_sampling_points', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->uuid('scheme_id')->nullable();
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->uuid('dma_id')->nullable();
            $table->foreign('dma_id')->references('id')->on('dmas')->onDelete('set null');
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->enum('kind', ['source', 'treatment', 'reservoir', 'distribution', 'kiosk', 'household']);
            $table->geometry('location', 'point', 4326);
            $table->decimal('elevation_m', 8, 2)->nullable();
            $table->jsonb('meta')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('scheme_id');
            $table->index('dma_id');
            $table->index('code');
            $table->index('kind');
            $table->index('is_active');
            $table->spatialIndex('location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_sampling_points');
    }
};
