<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actuals', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('cost_center_id')->constrained('cost_centers');
            $table->foreignId('gl_account_id')->constrained('gl_accounts');
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('scheme_id')->nullable();
            $table->unsignedBigInteger('dma_id')->nullable();
            $table->enum('class', ['domestic', 'commercial', 'institutional', 'kiosk'])->nullable();
            $table->date('period');
            $table->decimal('amount', 20, 2);
            $table->enum('source', ['gl', 'proc', 'cmms', 'manual'])->default('manual');
            $table->string('ref')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'period']);
            $table->index(['cost_center_id', 'gl_account_id', 'period']);
            $table->index(['source', 'ref']);
        });

        Schema::create('encumbrances', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->enum('entity_type', ['requisition', 'po', 'contract']);
            $table->unsignedBigInteger('entity_id');
            $table->foreignId('cost_center_id')->constrained('cost_centers');
            $table->date('period');
            $table->decimal('amount', 20, 2);
            $table->boolean('released')->default(false);
            $table->timestamp('released_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'entity_type', 'entity_id']);
            $table->index(['cost_center_id', 'period', 'released']);
        });

        Schema::create('unit_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('item_code', 50);
            $table->string('name');
            $table->string('unit', 20);
            $table->enum('method', ['wap', 'fifo'])->default('wap');
            $table->date('period');
            $table->decimal('unit_cost', 20, 4);
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'item_code', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_costs');
        Schema::dropIfExists('encumbrances');
        Schema::dropIfExists('actuals');
    }
};
