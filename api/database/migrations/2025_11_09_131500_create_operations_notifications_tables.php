<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalation_policies', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('name');
            $table->jsonb('rules');
            $table->timestamps();
            
            $table->index('tenant_id');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->enum('channel', ['email', 'sms', 'webhook', 'push']);
            $table->string('to');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->timestampTz('sent_at')->nullable();
            $table->enum('status', ['queued', 'sent', 'failed'])->default('queued');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('sent_at');
            $table->index('channel');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('escalation_policies');
    }
};
