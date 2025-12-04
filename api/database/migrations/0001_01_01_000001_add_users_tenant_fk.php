<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds foreign key constraint for users.current_tenant_id to tenants table.
 * This runs after both tenants and users tables are created.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add FK constraint for current_tenant_id to tenants table
            $table->foreign('current_tenant_id')
                  ->references('id')
                  ->on('tenants')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_tenant_id']);
        });
    }
};
