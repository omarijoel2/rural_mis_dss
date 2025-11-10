<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->integer('fiscal_year');
            $table->enum('status', ['draft', 'approved', 'revised', 'archived'])->default('draft');
            $table->boolean('is_rolling')->default(false);
            $table->foreignId('base_version_id')->nullable()->constrained('budget_versions')->nullOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['tenant_id', 'fiscal_year', 'status']);
        });

        Schema::create('budget_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('version_id')->constrained('budget_versions')->cascadeOnDelete();
            $table->foreignId('cost_center_id')->constrained('cost_centers');
            $table->foreignId('gl_account_id')->constrained('gl_accounts');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('scheme_id')->nullable();
            $table->unsignedBigInteger('dma_id')->nullable();
            $table->enum('class', ['domestic', 'commercial', 'institutional', 'kiosk'])->nullable();
            $table->date('period');
            $table->decimal('amount', 20, 2);
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['version_id', 'period']);
            $table->index(['cost_center_id', 'gl_account_id', 'period']);
            $table->index(['scheme_id', 'period']);
            $table->index(['dma_id', 'period']);
        });

        Schema::create('forecasts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('method', ['manual', 'naive', 'ets', 'arima', 'prophet_stub'])->default('manual');
            $table->integer('horizon_months')->default(12);
            $table->foreignId('base_version_id')->nullable()->constrained('budget_versions')->nullOnDelete();
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
        });

        Schema::create('forecast_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('forecast_id')->constrained('forecasts')->cascadeOnDelete();
            $table->foreignId('cost_center_id')->constrained('cost_centers');
            $table->foreignId('gl_account_id')->constrained('gl_accounts');
            $table->unsignedBigInteger('scheme_id')->nullable();
            $table->unsignedBigInteger('dma_id')->nullable();
            $table->enum('class', ['domestic', 'commercial', 'institutional', 'kiosk'])->nullable();
            $table->date('period');
            $table->decimal('amount', 20, 2);
            $table->jsonb('method_meta')->nullable();
            $table->timestamps();

            $table->index(['forecast_id', 'period']);
            $table->index(['cost_center_id', 'gl_account_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forecast_lines');
        Schema::dropIfExists('forecasts');
        Schema::dropIfExists('budget_lines');
        Schema::dropIfExists('budget_versions');
    }
};
