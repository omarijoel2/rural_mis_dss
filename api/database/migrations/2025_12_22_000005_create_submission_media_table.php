<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('submission_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('submission_id')->constrained('submissions')->cascadeOnDelete();
            $table->string('key');
            $table->string('filename');
            $table->string('content_type')->nullable();
            $table->bigInteger('size_bytes')->nullable();
            $table->json('gps')->nullable();
            $table->timestampTz('captured_at')->nullable();
            $table->timestampTz('uploaded_at')->nullable();
            $table->timestampsTz();
        });
    }

    public function down()
    {
        Schema::dropIfExists('submission_media');
    }
};