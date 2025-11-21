<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crm_service_connections', function (Blueprint $table) {
            $table->string('account_no')->nullable()->after('connection_no');
            $table->unsignedBigInteger('customer_id')->nullable()->after('premise_id');
            $table->unsignedBigInteger('tariff_id')->nullable()->after('meter_id');
            
            $table->foreign('customer_id')->references('id')->on('crm_customers')->nullOnDelete();
            $table->foreign('tariff_id')->references('id')->on('crm_tariffs')->nullOnDelete();
            
            $table->index('account_no');
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('crm_service_connections', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['tariff_id']);
            $table->dropColumn(['account_no', 'customer_id', 'tariff_id']);
        });
    }
};
