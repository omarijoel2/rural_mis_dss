<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('account_no');
            $table->timestampTz('paid_at');
            $table->decimal('amount', 12, 2);
            $table->enum('channel', ['cash', 'bank', 'mpesa', 'online', 'adjustment'])->default('cash');
            $table->string('ref')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->index('tenant_id');
            $table->index('account_no');
            $table->index('paid_at');
            $table->index('ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_payments');
    }
};
