<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_tariffs', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->jsonb('blocks');
            $table->decimal('fixed_charge', 10, 2)->default(0);
            $table->string('currency', 3)->default('KES');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->index('tenant_id');
            $table->index(['tenant_id', 'valid_from', 'valid_to']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_tariffs');
    }
};
