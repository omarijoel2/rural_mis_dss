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
        Schema::create('pm_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_class_id')->nullable()->constrained('asset_classes')->onDelete('cascade');
            $table->foreignId('asset_id')->nullable()->constrained('assets')->onDelete('cascade');
            $table->string('title');
            $table->enum('strategy', ['time', 'meter', 'condition', 'seasonal']);
            $table->integer('interval_days')->nullable();
            $table->decimal('interval_meter', 10, 4)->nullable();
            $table->jsonb('due_rule')->nullable();
            $table->jsonb('window')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->integer('sla_hours')->default(24);
            $table->jsonb('checklist_schema')->nullable();
            $table->timestamps();
            
            $table->index('asset_class_id');
            $table->index('asset_id');
            $table->index('strategy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pm_policies');
    }
};
