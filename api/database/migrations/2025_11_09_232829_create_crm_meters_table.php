<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_meters', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('serial_no')->unique();
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->integer('size_mm')->nullable();
            $table->enum('meter_type', ['mechanical', 'ultrasonic', 'prepaid'])->default('mechanical');
            $table->date('install_date')->nullable();
            $table->enum('status', ['in_service', 'faulty', 'replaced', 'lost'])->default('in_service');
            $table->timestampTz('last_read_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            
            $table->index('tenant_id');
            $table->index('serial_no');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_meters');
    }
};
