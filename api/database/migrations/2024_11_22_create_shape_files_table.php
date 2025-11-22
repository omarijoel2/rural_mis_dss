<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shape_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->bigInteger('file_size');
            $table->string('geom_type')->nullable(); // polygon, linestring, point, etc.
            $table->string('projection_crs')->default('EPSG:4326');
            $table->json('bounds')->nullable(); // min_lon, min_lat, max_lon, max_lat
            $table->integer('feature_count')->nullable();
            $table->json('properties_schema')->nullable(); // Column definitions
            $table->enum('status', ['uploading', 'processing', 'processed', 'failed'])->default('uploading');
            $table->uuid('uploaded_by')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shape_files');
    }
};
