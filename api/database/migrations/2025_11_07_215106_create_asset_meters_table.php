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
        Schema::create('asset_meters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->enum('kind', ['hours', 'starts', 'flow', 'pressure', 'custom']);
            $table->string('unit', 50);
            $table->decimal('multiplier', 10, 4)->default(1);
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('kind');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_meters');
    }
};
