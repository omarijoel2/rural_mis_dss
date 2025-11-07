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
        Schema::create('parts', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('unit', 50);
            $table->decimal('min_qty', 10, 4)->default(0);
            $table->decimal('reorder_qty', 10, 4)->default(0);
            $table->decimal('cost', 12, 2)->default(0);
            $table->string('location')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('sku');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts');
    }
};
