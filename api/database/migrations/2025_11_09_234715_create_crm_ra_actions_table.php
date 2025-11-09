<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_ra_actions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ra_case_id');
            $table->enum('action', ['request_read', 'dispatch_field', 'disconnect', 'reconnect', 'replace_meter', 'tariff_audit', 'write_off', 'bill_adjust']);
            $table->jsonb('payload')->nullable();
            $table->uuid('actor_id');
            $table->timestampTz('occurred_at');
            $table->timestamps();

            $table->foreign('ra_case_id')->references('id')->on('crm_ra_cases')->cascadeOnDelete();
            $table->foreign('actor_id')->references('id')->on('users')->cascadeOnDelete();
            
            $table->index('ra_case_id');
            $table->index('occurred_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_ra_actions');
    }
};
