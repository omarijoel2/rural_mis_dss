<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_sample_params', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sample_id')->constrained('wq_samples')->onDelete('cascade');
            $table->foreignId('parameter_id')->constrained('wq_parameters')->onDelete('cascade');
            $table->enum('status', ['pending', 'in_analysis', 'resulted', 'invalid'])->default('pending');
            $table->string('method')->nullable();
            $table->timestamps();
            
            $table->index('sample_id');
            $table->index('parameter_id');
            $table->index('status');
            $table->unique(['sample_id', 'parameter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_sample_params');
    }
};
