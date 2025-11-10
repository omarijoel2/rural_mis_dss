<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gl_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 50)->index();
            $table->string('name');
            $table->enum('type', ['revenue', 'opex', 'capex', 'inventory', 'cogs', 'other']);
            $table->foreignId('parent_id')->nullable()->constrained('gl_accounts')->cascadeOnDelete();
            $table->boolean('active')->default(true);
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'type']);
        });

        Schema::create('cost_centers', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 50)->index();
            $table->string('name');
            $table->foreignId('parent_id')->nullable()->constrained('cost_centers')->cascadeOnDelete();
            $table->foreignUuid('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('active')->default(true);
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code', 50)->index();
            $table->string('name');
            $table->text('formula')->nullable();
            $table->string('unit', 50)->nullable();
            $table->enum('source', ['static', 'sql', 'api']);
            $table->jsonb('params')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'code']);
        });

        Schema::create('driver_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->cascadeOnDelete();
            $table->date('period');
            $table->decimal('value', 20, 4);
            $table->enum('scope', ['tenant', 'scheme', 'dma', 'class']);
            $table->unsignedBigInteger('scope_id')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['driver_id', 'period']);
            $table->index(['driver_id', 'scope', 'scope_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_values');
        Schema::dropIfExists('drivers');
        Schema::dropIfExists('cost_centers');
        Schema::dropIfExists('gl_accounts');
    }
};
