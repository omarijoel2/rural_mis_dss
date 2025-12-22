<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('conflicts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('resource_type');
            $table->string('resource_id')->nullable();
            $table->json('server_payload')->nullable();
            $table->json('client_payload')->nullable();
            $table->enum('resolution', ['pending', 'resolved'])->default('pending');
            $table->enum('resolution_action', ['accept_server', 'accept_client', 'merged'])->nullable();
            $table->foreignUuid('resolved_by')->nullable()->constrained('users');
            $table->timestampTz('resolved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestampsTz();
        });
    }

    public function down()
    {
        Schema::dropIfExists('conflicts');
    }
};