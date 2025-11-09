<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wq_parameters', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->enum('group', ['physical', 'chemical', 'biological']);
            $table->string('unit', 50)->nullable();
            $table->text('method')->nullable();
            $table->decimal('lod', 10, 4)->nullable()->comment('Limit of Detection');
            $table->decimal('loi', 10, 4)->nullable()->comment('Limit of Identification');
            $table->decimal('who_limit', 10, 4)->nullable()->comment('WHO Guideline Limit');
            $table->decimal('wasreb_limit', 10, 4)->nullable()->comment('WASREB Limit');
            $table->decimal('local_limit', 10, 4)->nullable()->comment('Custom/Local Limit');
            $table->text('advisory')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('code');
            $table->index('group');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wq_parameters');
    }
};
