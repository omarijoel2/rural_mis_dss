<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // API Keys - API key management
        Schema::create('api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('hash');
            $table->jsonb('scopes')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('revoked')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['tenant_id', 'revoked']);
        });

        // Device Trust - Device fingerprinting for 2FA
        Schema::create('device_trust', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('device_fingerprint');
            $table->string('platform')->nullable();
            $table->timestamp('registered_at');
            $table->timestamp('last_seen_at')->nullable();
            $table->boolean('revoked')->default(false);
            $table->timestamps();
            
            $table->index(['user_id', 'revoked']);
            $table->index('device_fingerprint');
        });

        // Data Classes - Data classification levels
        Schema::create('data_classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->text('description');
            $table->timestamps();
        });

        // Data Catalog - Column-level data classification
        Schema::create('data_catalog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('table_name');
            $table->string('column_name');
            $table->foreignUuid('data_class_id')->constrained('data_classes')->cascadeOnDelete();
            $table->string('encryption')->default('none');
            $table->string('mask')->default('none');
            $table->jsonb('purpose_tags')->nullable();
            $table->timestamps();
            
            $table->unique(['table_name', 'column_name']);
            $table->index('data_class_id');
        });

        // Retention Policies - Data retention rules
        Schema::create('retention_policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('entity_type');
            $table->integer('keep_for_days');
            $table->string('action');
            $table->boolean('legal_hold')->default(false);
            $table->timestamps();
            
            $table->index('entity_type');
        });

        // Consents - User consent tracking
        Schema::create('consents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('purpose');
            $table->timestamp('granted_at');
            $table->timestamp('revoked_at')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'granted_at']);
        });

        // DSR Requests - Data Subject Rights requests
        Schema::create('dsr_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('requester_id')->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->foreignUuid('target_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('new');
            $table->timestamp('submitted_at');
            $table->timestamp('completed_at')->nullable();
            $table->jsonb('artifacts')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index('target_user_id');
        });

        // Audit Events - Audit trail
        Schema::create('audit_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->uuid('actor_id')->nullable();
            $table->string('actor_type');
            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->string('entity_id')->nullable();
            $table->string('ip')->nullable();
            $table->text('ua')->nullable();
            $table->jsonb('diff')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            
            $table->index(['tenant_id', 'occurred_at', 'actor_id']);
            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
        });

        // Security Alerts - Security incident alerts
        Schema::create('security_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('category');
            $table->string('severity');
            $table->text('message');
            $table->jsonb('details')->nullable();
            $table->timestamp('raised_at')->useCurrent();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'severity', 'raised_at']);
            $table->index('category');
        });

        // KMS Keys - Key Management System keys
        Schema::create('kms_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('purpose');
            $table->text('key_ref');
            $table->timestamp('rotated_at')->nullable();
            $table->timestamps();
            
            $table->index('purpose');
        });

        // Secrets - Encrypted application secrets
        Schema::create('secrets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('key');
            $table->text('value_ciphertext');
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('rotated_at')->nullable();
            $table->timestamps();
            
            $table->unique(['tenant_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secrets');
        Schema::dropIfExists('kms_keys');
        Schema::dropIfExists('security_alerts');
        Schema::dropIfExists('audit_events');
        Schema::dropIfExists('dsr_requests');
        Schema::dropIfExists('consents');
        Schema::dropIfExists('retention_policies');
        Schema::dropIfExists('data_catalog');
        Schema::dropIfExists('data_classes');
        Schema::dropIfExists('device_trust');
        Schema::dropIfExists('api_keys');
    }
};
