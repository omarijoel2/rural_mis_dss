<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_customers', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('customer_no')->unique();
            $table->string('name');
            $table->enum('id_type', ['nat_id', 'passport', 'org'])->default('nat_id');
            $table->string('id_no');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->unsignedBigInteger('premise_id')->nullable();
            $table->text('contact_address')->nullable();
            $table->jsonb('kyc')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->foreign('premise_id')->references('id')->on('crm_premises')->nullOnDelete();
            
            $table->index('tenant_id');
            $table->index('customer_no');
            $table->index(['name', 'tenant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_customers');
    }
};
