<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Creates the tenants table FIRST before users and all other tables.
 * This is essential for multi-tenancy as nearly every table references tenants.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Enable PostGIS extension if not already enabled
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
        
        // Tenants - multi-tenancy root table
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('short_code', 32)->unique();
            $table->string('county')->nullable()->comment('County name for this tenant');
            $table->string('country', 2)->default('KE');
            $table->string('timezone')->default('Africa/Nairobi');
            $table->string('currency', 3)->default('KES');
            $table->string('logo_path')->nullable();
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
