<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sample_param_id')->constrained('wq_sample_params')->onDelete('cascade');
            $table->decimal('value', 12, 4)->nullable();
            $table->enum('value_qualifier', ['<', '>', '~'])->nullable();
            $table->string('unit', 50)->nullable();
            $table->timestampTz('analyzed_at');
            $table->uuid('analyst_id')->nullable();
            $table->foreign('analyst_id')->references('id')->on('users')->onDelete('set null');
            $table->string('instrument')->nullable();
            $table->decimal('lod', 10, 4)->nullable()->comment('Limit of Detection for this result');
            $table->decimal('uncertainty', 10, 4)->nullable();
            $table->jsonb('qc_flags')->default('[]');
            $table->timestamps();
            
            $table->index('sample_param_id');
            $table->index('analyst_id');
            $table->index('analyzed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_results');
    }
};
