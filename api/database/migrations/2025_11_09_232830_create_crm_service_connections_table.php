<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_service_connections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('premise_id');
            $table->string('connection_no')->unique();
            $table->enum('status', ['active', 'pending', 'disconnected', 'illegal', 'abandoned'])->default('pending');
            $table->enum('connection_type', ['individual', 'shared', 'kiosk', 'yard_tap'])->default('individual');
            $table->date('install_date')->nullable();
            $table->unsignedBigInteger('meter_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('premise_id')->references('id')->on('crm_premises')->cascadeOnDelete();
            $table->foreign('meter_id')->references('id')->on('crm_meters')->nullOnDelete();
            
            $table->index('premise_id');
            $table->index('connection_no');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_service_connections');
    }
};
