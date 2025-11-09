<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_samples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sampling_point_id')->constrained('wq_sampling_points')->onDelete('cascade');
            $table->foreignId('plan_id')->nullable()->constrained('wq_plans')->onDelete('set null');
            $table->string('barcode')->unique();
            $table->timestampTz('scheduled_for')->nullable();
            $table->timestampTz('collected_at')->nullable();
            $table->uuid('collected_by')->nullable();
            $table->foreign('collected_by')->references('id')->on('users')->onDelete('set null');
            $table->decimal('temp_c_on_receipt', 4, 1)->nullable();
            $table->enum('custody_state', ['scheduled', 'collected', 'received_lab', 'in_analysis', 'reported', 'invalid'])->default('scheduled');
            $table->jsonb('photos')->nullable();
            $table->jsonb('chain')->nullable()->comment('Chain of custody history');
            $table->timestamps();
            
            $table->index('sampling_point_id');
            $table->index('plan_id');
            $table->index('barcode');
            $table->index('custody_state');
            $table->index('collected_by');
            $table->index(['scheduled_for', 'collected_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_samples');
    }
};
