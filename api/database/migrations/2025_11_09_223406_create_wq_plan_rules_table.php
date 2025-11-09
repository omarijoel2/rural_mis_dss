<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_plan_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('wq_plans')->onDelete('cascade');
            $table->enum('point_kind', ['source', 'treatment', 'reservoir', 'distribution', 'kiosk', 'household']);
            $table->enum('parameter_group', ['physical', 'chemical', 'biological']);
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'adhoc']);
            $table->integer('sample_count')->default(1);
            $table->string('container_type')->nullable();
            $table->string('preservatives')->nullable();
            $table->integer('holding_time_hrs')->nullable();
            $table->timestamps();
            
            $table->index('plan_id');
            $table->index(['point_kind', 'parameter_group']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_plan_rules');
    }
};
