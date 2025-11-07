<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meter_captures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_meter_id')->constrained('asset_meters')->onDelete('cascade');
            $table->timestampTz('captured_at');
            $table->decimal('value', 15, 4);
            $table->enum('source', ['manual', 'scada', 'ami', 'import'])->default('manual');
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            
            $table->index('asset_meter_id');
            $table->index('captured_at');
            $table->index('source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_captures');
    }
};
