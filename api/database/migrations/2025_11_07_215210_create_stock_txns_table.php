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
        Schema::create('stock_txns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('parts')->onDelete('restrict');
            $table->enum('kind', ['receive', 'issue', 'adjust']);
            $table->decimal('qty', 10, 4);
            $table->decimal('unit_cost', 12, 2);
            $table->string('ref')->nullable();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->timestampTz('occurred_at');
            $table->timestamps();
            
            $table->index('part_id');
            $table->index('work_order_id');
            $table->index('kind');
            $table->index('occurred_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_txns');
    }
};
