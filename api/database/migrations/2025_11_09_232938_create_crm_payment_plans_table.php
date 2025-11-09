<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_payment_plans', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('account_no');
            $table->enum('status', ['active', 'completed', 'defaulted'])->default('active');
            $table->jsonb('schedule');
            $table->date('next_due')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->index('tenant_id');
            $table->index('account_no');
            $table->index(['status', 'next_due']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_payment_plans');
    }
};
