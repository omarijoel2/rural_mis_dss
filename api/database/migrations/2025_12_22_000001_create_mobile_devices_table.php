<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mobile_devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('device_id')->unique();
            $table->foreignUuid('user_id')->nullable()->constrained('users');
            $table->string('device_type');
            $table->string('os_version')->nullable();
            $table->string('app_version')->nullable();
            $table->string('push_token')->nullable();
            $table->enum('status', ['active', 'suspended', 'revoked'])->default('active');
            $table->float('trust_score')->default(0);
            $table->json('metadata')->nullable();
            $table->timestampTz('last_seen')->nullable();
            $table->timestampsTz();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mobile_devices');
    }
};