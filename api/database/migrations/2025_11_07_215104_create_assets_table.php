<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->uuid('scheme_id')->nullable();
            $table->foreign('scheme_id')->references('id')->on('schemes')->onDelete('set null');
            $table->uuid('dma_id')->nullable();
            $table->foreign('dma_id')->references('id')->on('dmas')->onDelete('set null');
            $table->foreignId('class_id')->constrained('asset_classes')->onDelete('restrict');
            $table->foreignId('parent_id')->nullable()->constrained('assets')->onDelete('cascade');
            $table->string('tag')->unique();
            $table->string('name');
            $table->string('serial_no')->nullable();
            $table->enum('status', ['in_service', 'standby', 'down', 'retired'])->default('in_service');
            $table->date('install_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->geometry('location', 'point', 4326)->nullable();
            $table->jsonb('properties')->nullable();
            $table->string('barcode')->nullable()->unique();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('scheme_id');
            $table->index('dma_id');
            $table->index('class_id');
            $table->index('parent_id');
            $table->index('status');
            $table->index('tag');
            $table->spatialIndex('location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
