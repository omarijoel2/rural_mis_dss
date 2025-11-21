<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_water_trucks', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('truck_no')->unique();
            $table->string('driver_name');
            $table->string('phone');
            $table->integer('capacity'); // liters
            $table->enum('status', ['available', 'in_transit', 'maintenance'])->default('available');
            $table->integer('trips_today')->default(0);
            $table->decimal('revenue_today', 10, 2)->default(0);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            
            $table->index('tenant_id');
            $table->index('truck_no');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_water_trucks');
    }
};
