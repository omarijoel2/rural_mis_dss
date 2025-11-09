<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_customer_reads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('meter_id');
            $table->timestampTz('read_at');
            $table->decimal('value', 10, 2);
            $table->string('photo_path')->nullable();
            $table->enum('read_source', ['manual', 'app', 'ami', 'import'])->default('manual');
            $table->enum('quality', ['good', 'estimated', 'bad'])->default('good');
            $table->unsignedBigInteger('reader_id')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->foreign('meter_id')->references('id')->on('crm_meters')->cascadeOnDelete();
            $table->foreign('reader_id')->references('id')->on('users')->nullOnDelete();
            
            $table->index('meter_id');
            $table->index(['meter_id', 'read_at']);
            $table->index('read_source');
        });

        DB::statement('ALTER TABLE crm_customer_reads ADD COLUMN geom geometry(Point, 4326)');
        DB::statement('CREATE INDEX crm_customer_reads_geom_gist ON crm_customer_reads USING GIST(geom)');
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_customer_reads');
    }
};
