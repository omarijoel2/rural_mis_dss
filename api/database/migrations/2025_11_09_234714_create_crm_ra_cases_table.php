<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_ra_cases', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('account_no')->nullable();
            $table->unsignedBigInteger('meter_id')->nullable();
            $table->unsignedBigInteger('premise_id')->nullable();
            $table->string('rule_code');
            $table->timestampTz('detected_at');
            $table->enum('severity', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['new', 'triage', 'field', 'resolved', 'closed'])->default('new');
            $table->decimal('score', 5, 2)->default(0);
            $table->text('description')->nullable();
            $table->jsonb('evidence')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->foreign('meter_id')->references('id')->on('crm_meters')->nullOnDelete();
            $table->foreign('premise_id')->references('id')->on('crm_premises')->nullOnDelete();
            
            $table->index('tenant_id');
            $table->index('account_no');
            $table->index(['status', 'severity']);
            $table->index('detected_at');
        });

        DB::statement('ALTER TABLE crm_ra_cases ADD COLUMN geom geometry(Point, 4326)');
        DB::statement('CREATE INDEX crm_ra_cases_geom_gist ON crm_ra_cases USING GIST(geom)');
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_ra_cases');
    }
};
