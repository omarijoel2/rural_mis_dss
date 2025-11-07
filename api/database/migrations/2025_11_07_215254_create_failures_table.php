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
        Schema::create('failures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('code')->nullable();
            $table->string('mode')->nullable();
            $table->text('cause')->nullable();
            $table->text('effect')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            $table->index('work_order_id');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('failures');
    }
};
