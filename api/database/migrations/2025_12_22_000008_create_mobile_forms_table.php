<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mobile_forms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->json('schema');
            $table->string('version')->nullable();
            $table->boolean('published')->default(false);
            $table->boolean('draft')->default(true);
            $table->foreignUuid('created_by')->nullable()->constrained('users');
            $table->timestampsTz();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mobile_forms');
    }
};