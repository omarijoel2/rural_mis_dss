<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_kiosks', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('kiosk_code')->unique();
            $table->string('vendor_name');
            $table->string('vendor_phone');
            $table->string('location');
            $table->jsonb('coordinates'); // {lat, lng}
            $table->decimal('daily_target', 10, 2)->default(0);
            $table->decimal('today_sales', 10, 2)->default(0);
            $table->decimal('balance', 10, 2)->default(0);
            $table->enum('status', ['active', 'suspended', 'inactive'])->default('active');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            
            $table->index('tenant_id');
            $table->index('kiosk_code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_kiosks');
    }
};
