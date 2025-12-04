<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('source_id')->nullable()->after('parent_id')->constrained('sources')->onDelete('set null');
            $table->foreignId('kiosk_id')->nullable()->after('source_id')->constrained('crm_kiosks')->onDelete('set null');
            
            $table->index('source_id');
            $table->index('kiosk_id');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['source_id']);
            $table->dropForeign(['kiosk_id']);
            $table->dropColumn(['source_id', 'kiosk_id']);
        });
    }
};
