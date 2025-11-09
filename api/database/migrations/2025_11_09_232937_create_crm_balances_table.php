<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_balances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('account_no');
            $table->date('as_of');
            $table->decimal('balance', 12, 2);
            $table->jsonb('aging')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->unique(['tenant_id', 'account_no', 'as_of']);
            $table->index('tenant_id');
            $table->index('account_no');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_balances');
    }
};
