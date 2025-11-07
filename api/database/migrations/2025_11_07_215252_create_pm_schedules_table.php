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
        Schema::create('pm_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pm_policy_id')->constrained('pm_policies')->onDelete('cascade');
            $table->timestampTz('next_due');
            $table->timestampTz('last_done')->nullable();
            $table->enum('status', ['active', 'paused'])->default('active');
            $table->timestamps();
            
            $table->index('pm_policy_id');
            $table->index('next_due');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pm_schedules');
    }
};
