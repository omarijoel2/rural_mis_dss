<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_meter_routes', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('route_code')->unique();
            $table->string('area');
            $table->string('assigned_to')->nullable();
            $table->integer('meters_count')->default(0);
            $table->enum('status', ['active', 'unassigned', 'inactive'])->default('unassigned');
            $table->date('last_read_date')->nullable();
            $table->decimal('completion_rate', 5, 2)->default(0); // percentage
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            
            $table->index('tenant_id');
            $table->index('route_code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_meter_routes');
    }
};
