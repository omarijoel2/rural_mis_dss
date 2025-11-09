<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_qc_controls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sample_id')->nullable()->constrained('wq_samples')->onDelete('cascade');
            $table->foreignId('parameter_id')->nullable()->constrained('wq_parameters')->onDelete('cascade');
            $table->enum('type', ['blank', 'duplicate', 'spike', 'control_sample']);
            $table->decimal('target_value', 12, 4)->nullable();
            $table->string('accepted_range')->nullable();
            $table->enum('outcome', ['pass', 'fail', 'warn'])->nullable();
            $table->jsonb('details')->nullable();
            $table->timestamps();
            
            $table->index('sample_id');
            $table->index('parameter_id');
            $table->index('type');
            $table->index('outcome');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_qc_controls');
    }
};
