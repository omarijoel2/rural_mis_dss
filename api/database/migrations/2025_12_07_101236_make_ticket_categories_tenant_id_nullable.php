<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_categories', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });

        DB::statement('ALTER TABLE ticket_categories ALTER COLUMN tenant_id DROP NOT NULL');

        Schema::table('ticket_categories', function (Blueprint $table) {
            $table->foreign('tenant_id')
                  ->references('id')
                  ->on('tenants')
                  ->nullOnDelete();
        });

        DB::table('ticket_categories')
            ->whereIn('code', ['BILLING', 'SUPPLY', 'QUALITY', 'METER', 'LEAK', 'CONNECTION', 'DISCONNECT', 'COMPLAINT'])
            ->update(['tenant_id' => null]);
    }

    public function down(): void
    {
        DB::table('ticket_categories')
            ->whereNull('tenant_id')
            ->update(['tenant_id' => 'a082a1ea-1a12-4168-af68-841498a137f9']);

        Schema::table('ticket_categories', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });

        DB::statement('ALTER TABLE ticket_categories ALTER COLUMN tenant_id SET NOT NULL');

        Schema::table('ticket_categories', function (Blueprint $table) {
            $table->foreign('tenant_id')
                  ->references('id')
                  ->on('tenants')
                  ->cascadeOnDelete();
        });
    }
};
