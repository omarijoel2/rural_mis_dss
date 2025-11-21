<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_plan_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_plan_id')->constrained('job_plans')->cascadeOnDelete();
            $table->integer('step_number')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('expected_duration_minutes')->nullable();
            $table->jsonb('tools_required')->nullable();
            $table->jsonb('parts_required')->nullable();
            $table->string('success_criteria')->nullable();
            $table->string('risk_level', 20)->default('low');
            $table->timestamps();

            $table->unique(['job_plan_id', 'step_number']);
            $table->index('job_plan_id');
        });

        Schema::create('work_order_step_executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('job_plan_step_id')->constrained('job_plan_steps')->cascadeOnDelete();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'failed', 'skipped'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->jsonb('observations')->nullable();
            $table->string('failure_reason')->nullable();
            $table->unsignedBigInteger('technician_id')->nullable();
            $table->timestamps();

            $table->index(['work_order_id', 'status']);
            $table->index('job_plan_step_id');
        });

        Schema::create('step_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_step_execution_id')->constrained('work_order_step_executions')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_type', 50);
            $table->bigInteger('file_size');
            $table->text('caption')->nullable();
            $table->timestamps();

            $table->index('work_order_step_execution_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('step_attachments');
        Schema::dropIfExists('work_order_step_executions');
        Schema::dropIfExists('job_plan_steps');
    }
};
