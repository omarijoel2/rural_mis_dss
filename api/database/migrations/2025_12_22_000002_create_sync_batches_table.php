<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sync_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('batch_token')->unique();
            $table->foreignUuid('device_id')->constrained('mobile_devices');
            $table->string('client_sync_token')->nullable();
            $table->string('server_sync_token')->nullable();
            $table->enum('status', ['received', 'processing', 'completed', 'failed'])->default('received');
            $table->integer('items_count')->default(0);
            $table->timestampsTz();
            $table->timestampTz('processed_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sync_batches');
    }
};