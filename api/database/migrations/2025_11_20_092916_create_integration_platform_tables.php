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
        // API Catalog - REST & GraphQL endpoint registry
        Schema::create('api_catalog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('version')->default('v1');
            $table->enum('type', ['rest', 'graphql', 'grpc'])->default('rest');
            $table->enum('auth_method', ['api_key', 'oauth', 'hmac', 'basic', 'bearer'])->default('api_key');
            $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['active', 'deprecated', 'disabled'])->default('active');
            $table->text('openapi_spec')->nullable();
            $table->string('base_url')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->jsonb('rate_limits')->nullable()->comment('Per-route rate limits & quotas');
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['tenant_id', 'name', 'version']);
        });

        // Webhooks - Callback management
        Schema::create('webhooks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('endpoint_url');
            $table->string('secret')->nullable();
            $table->jsonb('event_topics')->comment('Array of subscribed topics');
            $table->enum('retry_policy', ['exponential', 'backoff', 'none'])->default('exponential');
            $table->integer('max_retries')->default(3);
            $table->enum('status', ['active', 'paused', 'failed'])->default('active');
            $table->timestamp('last_delivery_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // Webhook Delivery Logs
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('webhook_id')->constrained('webhooks')->cascadeOnDelete();
            $table->string('event_type');
            $table->jsonb('payload');
            $table->integer('http_status')->nullable();
            $table->text('response_body')->nullable();
            $table->integer('attempt_count')->default(1);
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();
            
            $table->index(['webhook_id', 'created_at']);
        });

        // Connectors - External system adapters
        Schema::create('connectors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['scada', 'ami', 'erp', 'waris', 'ndma', 'payments', 'messaging', 'custom'])->default('custom');
            $table->enum('mode', ['polling', 'subscribe', 'webhook'])->default('polling');
            $table->jsonb('credentials')->comment('Encrypted connection credentials');
            $table->jsonb('config')->nullable()->comment('Connector-specific config');
            $table->enum('status', ['active', 'paused', 'error'])->default('active');
            $table->timestamp('last_sync_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();
            
            $table->unique(['tenant_id', 'name']);
        });

        // Connector Sync Jobs
        Schema::create('connector_syncs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('connector_id')->constrained('connectors')->cascadeOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->integer('records_fetched')->default(0);
            $table->integer('records_processed')->default(0);
            $table->integer('records_failed')->default(0);
            $table->enum('status', ['running', 'completed', 'failed'])->default('running');
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index(['connector_id', 'started_at']);
        });

        // ETL/ELT Jobs
        Schema::create('etl_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['import', 'export', 'transform'])->default('import');
            $table->string('source_type')->nullable()->comment('file, database, api, connector');
            $table->string('target_type')->nullable();
            $table->jsonb('config')->nullable()->comment('Job-specific parameters');
            $table->string('schedule')->nullable()->comment('Cron expression');
            $table->enum('status', ['active', 'paused', 'disabled'])->default('active');
            $table->timestamps();
            
            $table->unique(['tenant_id', 'name']);
        });

        // ETL Job Runs
        Schema::create('etl_job_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('etl_job_id')->constrained('etl_jobs')->cascadeOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->enum('status', ['running', 'completed', 'failed'])->default('running');
            $table->integer('rows_processed')->default(0);
            $table->integer('rows_failed')->default(0);
            $table->text('error_log')->nullable();
            $table->timestamps();
            
            $table->index(['etl_job_id', 'started_at']);
        });

        // Data Warehouse Catalog
        Schema::create('dw_catalog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->string('schema_name');
            $table->string('table_name');
            $table->enum('zone', ['raw', 'refined', 'curated'])->default('raw');
            $table->text('description')->nullable();
            $table->jsonb('schema_def')->nullable()->comment('Column definitions');
            $table->jsonb('tags')->nullable()->comment('Domain, sensitivity, etc.');
            $table->timestamp('freshness_at')->nullable()->comment('Last data update');
            $table->timestamps();
            
            $table->unique(['schema_name', 'table_name']);
            $table->index(['tenant_id', 'zone']);
        });

        // Data Lineage
        Schema::create('data_lineage', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('source_table_id')->constrained('dw_catalog')->cascadeOnDelete();
            $table->foreignUuid('target_table_id')->constrained('dw_catalog')->cascadeOnDelete();
            $table->string('transformation')->nullable()->comment('SQL or ETL job reference');
            $table->timestamps();
            
            $table->index(['source_table_id', 'target_table_id']);
        });

        // Data Retention Policies (extended from security)
        Schema::create('dw_retention_policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('catalog_table_id')->constrained('dw_catalog')->cascadeOnDelete();
            $table->integer('hot_days')->default(90)->comment('Days in hot storage');
            $table->integer('warm_days')->default(365)->comment('Days in warm storage');
            $table->integer('cold_days')->default(2555)->comment('Days in cold/archive (7 years)');
            $table->enum('action_after', ['archive', 'delete'])->default('archive');
            $table->timestamps();
            
            $table->index('catalog_table_id');
        });

        // Message Bus Events (pub/sub topics)
        Schema::create('message_bus_topics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->string('topic_name')->unique();
            $table->text('description')->nullable();
            $table->jsonb('schema')->nullable()->comment('Event payload schema');
            $table->timestamps();
        });

        // Message Bus Subscriptions
        Schema::create('message_bus_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('topic_id')->constrained('message_bus_topics')->cascadeOnDelete();
            $table->string('subscriber_name');
            $table->string('endpoint_url')->nullable();
            $table->enum('delivery_mode', ['push', 'pull'])->default('push');
            $table->enum('status', ['active', 'paused'])->default('active');
            $table->timestamps();
            
            $table->index(['topic_id', 'status']);
        });

        // Communication Templates (SMS/Email/WhatsApp) - MUST be created before comm_queue
        Schema::create('comm_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('channel', ['sms', 'email', 'whatsapp', 'ussd'])->default('sms');
            $table->string('locale', 5)->default('en');
            $table->text('subject')->nullable();
            $table->text('body');
            $table->jsonb('placeholders')->nullable()->comment('Available variables');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
            
            $table->unique(['tenant_id', 'name', 'channel', 'locale']);
        });

        // Communication Queue (references comm_templates above)
        Schema::create('comm_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('template_id')->nullable()->constrained('comm_templates')->nullOnDelete();
            $table->enum('channel', ['sms', 'email', 'whatsapp', 'ussd']);
            $table->string('recipient');
            $table->text('message');
            $table->enum('status', ['queued', 'sending', 'delivered', 'failed'])->default('queued');
            $table->enum('priority', ['high', 'normal', 'low'])->default('normal');
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamps();
            
            $table->index(['tenant_id', 'status', 'scheduled_for']);
        });

        // Low-Code Forms
        Schema::create('lowcode_forms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->jsonb('fields')->comment('Form field definitions');
            $table->jsonb('validation_rules')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // Low-Code Workflows
        Schema::create('lowcode_workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->jsonb('states')->comment('State machine definition');
            $table->jsonb('transitions')->comment('Allowed state changes');
            $table->jsonb('actions')->nullable()->comment('Actions per transition');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // Edge Devices (sync gateways, kiosks)
        Schema::create('edge_devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('device_id')->unique();
            $table->string('name');
            $table->enum('role', ['edge', 'kiosk', 'mobile'])->default('edge');
            $table->foreignUuid('site_id')->nullable()->constrained('facilities')->nullOnDelete();
            $table->timestamp('last_seen_at')->nullable();
            $table->integer('queue_depth')->default(0);
            $table->enum('status', ['online', 'offline', 'error'])->default('offline');
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // Observability Metrics
        Schema::create('ops_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->string('service_name');
            $table->string('metric_name');
            $table->decimal('value', 10, 2);
            $table->string('unit')->default('count');
            $table->jsonb('tags')->nullable()->comment('Additional dimensions');
            $table->timestamp('recorded_at')->useCurrent();
            
            $table->index(['service_name', 'metric_name', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ops_metrics');
        Schema::dropIfExists('edge_devices');
        Schema::dropIfExists('lowcode_workflows');
        Schema::dropIfExists('lowcode_forms');
        Schema::dropIfExists('comm_queue');
        Schema::dropIfExists('comm_templates');
        Schema::dropIfExists('message_bus_subscriptions');
        Schema::dropIfExists('message_bus_topics');
        Schema::dropIfExists('dw_retention_policies');
        Schema::dropIfExists('data_lineage');
        Schema::dropIfExists('dw_catalog');
        Schema::dropIfExists('etl_job_runs');
        Schema::dropIfExists('etl_jobs');
        Schema::dropIfExists('connector_syncs');
        Schema::dropIfExists('connectors');
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('webhooks');
        Schema::dropIfExists('api_catalog');
    }
};
