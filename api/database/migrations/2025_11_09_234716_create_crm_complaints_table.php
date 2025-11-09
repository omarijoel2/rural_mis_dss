<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_complaints', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('account_no')->nullable();
            $table->string('category');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'triage', 'field', 'resolved', 'closed'])->default('open');
            $table->timestampTz('resolved_at')->nullable();
            $table->text('resolution')->nullable();
            $table->jsonb('attachments')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            $table->foreign('customer_id')->references('id')->on('crm_customers')->nullOnDelete();
            
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('account_no');
            $table->index(['status', 'priority']);
        });

        DB::statement('ALTER TABLE crm_complaints ADD COLUMN geom geometry(Point, 4326)');
        DB::statement('CREATE INDEX crm_complaints_geom_gist ON crm_complaints USING GIST(geom)');
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_complaints');
    }
};
