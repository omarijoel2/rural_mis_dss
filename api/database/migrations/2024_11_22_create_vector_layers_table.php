<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vector_layers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->uuid('source_file_id')->index();
            $table->enum('layer_type', ['fill', 'line', 'circle', 'symbol'])->default('fill');
            $table->boolean('visibility')->default(true);
            $table->decimal('opacity', 3, 2)->default(0.6); // 0-1
            $table->string('fill_color')->default('#3b82f6');
            $table->string('stroke_color')->default('#1e40af');
            $table->integer('stroke_width')->default(2);
            $table->json('properties_display')->nullable(); // Which properties to show
            $table->json('filter_config')->nullable(); // MapLibre filter expressions
            $table->integer('z_index')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('source_file_id')->references('id')->on('shape_files')->onDelete('cascade');
            $table->index(['tenant_id', 'source_file_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vector_layers');
    }
};
