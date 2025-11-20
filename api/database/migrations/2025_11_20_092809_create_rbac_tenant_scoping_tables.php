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
        // Tenant-User pivot (many-to-many with ABAC attributes)
        Schema::create('tenant_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->jsonb('attrs')->nullable()->comment('ABAC attributes: scheme_ids, dma_ids, department, etc.');
            $table->timestamps();
            
            $table->unique(['tenant_id', 'user_id']);
            $table->index(['user_id', 'tenant_id']);
        });

        // Add tenant_id to Spatie roles table for per-tenant roles
        Schema::table('roles', function (Blueprint $table) {
            $table->foreignUuid('tenant_id')->nullable()->after('id')->constrained('tenants')->cascadeOnDelete();
            $table->index('tenant_id');
        });

        // Add tenant_id to model_has_roles for per-tenant role assignments
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->foreignUuid('tenant_id')->nullable()->after('model_id')->constrained('tenants')->cascadeOnDelete();
            $table->index(['model_id', 'tenant_id']);
        });

        // Add tenant_id to permissions table (optional, for future tenant-specific permissions)
        Schema::table('permissions', function (Blueprint $table) {
            $table->foreignUuid('tenant_id')->nullable()->after('id')->constrained('tenants')->cascadeOnDelete();
            $table->index('tenant_id');
        });

        // Personal Access Tokens (Sanctum extended)
        Schema::create('personal_access_tokens_extended', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->jsonb('abilities')->nullable();
            $table->jsonb('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'tenant_id']);
        });

        // Session limits tracking
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->string('session_id')->unique();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('two_factor_verified_at')->nullable();
            $table->uuid('impersonator_id')->nullable();
            $table->timestamp('last_activity')->useCurrent();
            $table->timestamps();
            
            $table->index(['user_id', 'last_activity']);
            $table->foreign('impersonator_id')->references('id')->on('users')->nullOnDelete();
        });

        // Impersonation audit log
        Schema::create('impersonation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('impersonator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('target_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
            
            $table->index(['impersonator_id', 'started_at']);
            $table->index(['target_user_id', 'started_at']);
        });

        // Password policy tracking
        Schema::create('password_policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->integer('min_length')->default(12);
            $table->boolean('require_uppercase')->default(true);
            $table->boolean('require_lowercase')->default(true);
            $table->boolean('require_numbers')->default(true);
            $table->boolean('require_special_chars')->default(true);
            $table->integer('rotation_days')->default(90);
            $table->integer('history_count')->default(5);
            $table->timestamps();
            
            $table->index('tenant_id');
        });

        // Password history for rotation enforcement
        Schema::create('password_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('password_hash');
            $table->timestamp('set_at')->useCurrent();
            
            $table->index(['user_id', 'set_at']);
        });

        // Login attempts tracking (rate limiting & security)
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email');
            $table->string('ip_address', 45);
            $table->boolean('successful')->default(false);
            $table->text('user_agent')->nullable();
            $table->timestamp('attempted_at')->useCurrent();
            
            $table->index(['email', 'ip_address', 'attempted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
        Schema::dropIfExists('password_history');
        Schema::dropIfExists('password_policies');
        Schema::dropIfExists('impersonation_logs');
        Schema::dropIfExists('user_sessions');
        Schema::dropIfExists('personal_access_tokens_extended');
        
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });
        
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });
        
        Schema::table('roles', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });
        
        Schema::dropIfExists('tenant_user');
    }
};
