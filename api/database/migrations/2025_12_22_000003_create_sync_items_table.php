<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sync_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('batch_id')->constrained('sync_batches')->cascadeOnDelete();
            $table->string('client_temp_id')->nullable();
            $table->string('resource_type');
            $table->enum('action', ['create', 'update', 'delete']);
            $table->json('payload')->nullable();
            $table->integer('client_version')->nullable();
            $table->integer('server_version')->nullable();
            $table->enum('status', ['pending', 'ok', 'conflict', 'error'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestampsTz();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sync_items');
    }
};