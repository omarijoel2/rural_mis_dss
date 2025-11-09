<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_compliance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sampling_point_id')->constrained('wq_sampling_points')->onDelete('cascade');
            $table->foreignId('parameter_id')->constrained('wq_parameters')->onDelete('cascade');
            $table->date('period');
            $table->enum('granularity', ['week', 'month', 'quarter']);
            $table->integer('samples_taken')->default(0);
            $table->integer('samples_compliant')->default(0);
            $table->decimal('compliance_pct', 5, 2)->default(0);
            $table->decimal('worst_value', 12, 4)->nullable();
            $table->integer('breaches')->default(0);
            $table->timestamps();
            
            $table->index('sampling_point_id');
            $table->index('parameter_id');
            $table->index(['period', 'granularity']);
            $table->unique(['sampling_point_id', 'parameter_id', 'period', 'granularity'], 'wq_compliance_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_compliance');
    }
};
