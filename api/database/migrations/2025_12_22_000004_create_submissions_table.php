<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('form_id');
            $table->string('form_version')->nullable();
            $table->json('data');
            $table->foreignUuid('device_id')->nullable()->constrained('mobile_devices');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->json('metadata')->nullable();
            $table->timestampsTz();
            $table->timestampTz('reviewed_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('submissions');
    }
};