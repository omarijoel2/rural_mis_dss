<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_ra_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('severity', ['low', 'medium', 'high'])->default('medium');
            $table->jsonb('params');
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->index('tenant_id');
            $table->index(['active', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_ra_rules');
    }
};
