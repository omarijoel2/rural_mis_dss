<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Customer Tariffs (pricing structures)
        Schema::create('customer_tariffs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('tariff_code')->unique();
            $table->string('name');
            $table->enum('category', ['domestic', 'commercial', 'industrial', 'institutional', 'kiosk'])->default('domestic');
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->jsonb('rate_blocks')->comment('Array of min/max/rate/lifeline blocks');
            $table->decimal('fixed_charge', 10, 2)->default(0);
            $table->decimal('vat_percent', 5, 2)->default(16);
            $table->timestamps();
            
            $table->index(['tenant_id', 'category', 'effective_date']);
        });

        // Billing Runs (execution tracking)
        Schema::create('billing_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('run_code')->unique();
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['draft', 'running', 'completed', 'failed'])->default('draft');
            $table->integer('accounts_processed')->default(0);
            $table->integer('invoices_generated')->default(0);
            $table->decimal('total_billed', 15, 2)->default(0);
            $table->foreignUuid('run_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_log')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // Meter Reading Routes
        Schema::create('meter_routes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->foreignUuid('dma_id')->nullable()->constrained('dmas')->nullOnDelete();
            $table->string('route_code')->unique();
            $table->string('name');
            $table->integer('meters_count')->default(0);
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('read_day')->nullable()->comment('Day of month for reading');
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // Meter Reading Cycles (scheduled periods)
        Schema::create('meter_reading_cycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('route_id')->constrained('meter_routes')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->integer('meters_total')->default(0);
            $table->integer('meters_read')->default(0);
            $table->integer('anomalies_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['route_id', 'period_start']);
        });

        // Payment Reconciliations
        Schema::create('payment_reconciliations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('reconciliation_code')->unique();
            $table->date('reconciliation_date');
            $table->enum('channel', ['mpesa', 'bank', 'cash', 'card', 'other'])->default('mpesa');
            $table->integer('payments_matched')->default(0);
            $table->integer('payments_unmatched')->default(0);
            $table->decimal('amount_matched', 15, 2)->default(0);
            $table->decimal('amount_unmatched', 15, 2)->default(0);
            $table->foreignUuid('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['draft', 'completed'])->default('draft');
            $table->timestamps();
            
            $table->index(['tenant_id', 'reconciliation_date']);
        });

        // CRM Ticket Categories
        Schema::create('ticket_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->integer('sla_response_hours')->default(24);
            $table->integer('sla_resolution_hours')->default(72);
            $table->timestamps();
        });

        // CRM Tickets
        Schema::create('crm_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('ticket_no')->unique();
            $table->foreignUuid('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('category_id')->constrained('ticket_categories')->cascadeOnDelete();
            $table->enum('channel', ['sms', 'ussd', 'whatsapp', 'email', 'phone', 'app', 'walk_in'])->default('phone');
            $table->string('subject');
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['new', 'assigned', 'in_progress', 'resolved', 'closed'])->default('new');
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sla_response_due')->nullable();
            $table->timestamp('sla_resolution_due')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->integer('csat_score')->nullable()->comment('1-5 rating');
            $table->timestamps();
            
            $table->index(['tenant_id', 'status', 'created_at']);
            $table->index(['customer_id', 'status']);
        });

        // Ticket Threads (conversation history)
        Schema::create('ticket_threads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ticket_id')->constrained('crm_tickets')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('actor_type', ['customer', 'agent', 'system'])->default('agent');
            $table->text('message');
            $table->jsonb('attachments')->nullable();
            $table->timestamp('sent_at')->useCurrent();
            
            $table->index(['ticket_id', 'sent_at']);
        });

        // Kiosks (authorized water kiosks)
        Schema::create('kiosks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->foreignUuid('dma_id')->nullable()->constrained('dmas')->nullOnDelete();
            $table->string('kiosk_code')->unique();
            $table->string('name');
            $table->string('vendor_name')->nullable();
            $table->string('vendor_phone')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->decimal('daily_sales_m3', 10, 2)->default(0);
            $table->decimal('balance', 10, 2)->default(0);
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });
        
        DB::statement('ALTER TABLE kiosks ADD COLUMN location geometry(Point,4326)');
        DB::statement('CREATE INDEX kiosks_location_idx ON kiosks USING GIST (location)');

        // Kiosk Sales (daily transactions)
        Schema::create('kiosk_sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kiosk_id')->constrained('kiosks')->cascadeOnDelete();
            $table->date('sale_date');
            $table->decimal('volume_m3', 10, 2);
            $table->decimal('amount', 10, 2);
            $table->string('receipt_no')->nullable();
            $table->timestamps();
            
            $table->index(['kiosk_id', 'sale_date']);
        });

        // Water Truck Trips
        Schema::create('truck_trips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('trip_code')->unique();
            $table->string('truck_registration');
            $table->string('driver_name');
            $table->string('driver_phone')->nullable();
            $table->decimal('volume_m3', 10, 2);
            $table->decimal('price_per_m3', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->string('source_location')->nullable();
            $table->string('delivery_location')->nullable();
            $table->timestamp('departure_time')->nullable();
            $table->timestamp('arrival_time')->nullable();
            $table->enum('status', ['scheduled', 'in_transit', 'delivered', 'verified'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });
        
        DB::statement('ALTER TABLE truck_trips ADD COLUMN route_geom geometry(LineString,4326)');
        DB::statement('CREATE INDEX truck_trips_route_idx ON truck_trips USING GIST (route_geom)');

        // Connection Applications (new service requests)
        Schema::create('connection_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('application_no')->unique();
            $table->string('applicant_name');
            $table->string('applicant_phone');
            $table->string('applicant_email')->nullable();
            $table->text('premise_address');
            $table->enum('connection_type', ['new', 'upgrade', 'temporary', 'reconnection'])->default('new');
            $table->enum('category', ['domestic', 'commercial', 'industrial', 'institutional'])->default('domestic');
            $table->decimal('estimated_cost', 10, 2)->default(0);
            $table->enum('status', ['submitted', 'approved', 'payment_pending', 'in_progress', 'completed', 'rejected'])->default('submitted');
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->jsonb('kyc_documents')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });
        
        DB::statement('ALTER TABLE connection_applications ADD COLUMN premise_location geometry(Point,4326)');
        DB::statement('CREATE INDEX connection_applications_location_idx ON connection_applications USING GIST (premise_location)');

        // Disconnections (service suspensions)
        Schema::create('disconnections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('customer_id')->constrained('users')->cascadeOnDelete();
            $table->string('account_no');
            $table->enum('reason', ['non_payment', 'illegal_connection', 'tampering', 'temporary', 'customer_request'])->default('non_payment');
            $table->enum('status', ['scheduled', 'executed', 'reconnected'])->default('scheduled');
            $table->date('scheduled_date')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamp('reconnected_at')->nullable();
            $table->foreignUuid('executed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['customer_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disconnections');
        DB::statement('DROP INDEX IF EXISTS connection_applications_location_idx');
        Schema::dropIfExists('connection_applications');
        DB::statement('DROP INDEX IF EXISTS truck_trips_route_idx');
        Schema::dropIfExists('truck_trips');
        Schema::dropIfExists('kiosk_sales');
        DB::statement('DROP INDEX IF EXISTS kiosks_location_idx');
        Schema::dropIfExists('kiosks');
        Schema::dropIfExists('ticket_threads');
        Schema::dropIfExists('crm_tickets');
        Schema::dropIfExists('ticket_categories');
        Schema::dropIfExists('payment_reconciliations');
        Schema::dropIfExists('meter_reading_cycles');
        Schema::dropIfExists('meter_routes');
        Schema::dropIfExists('billing_runs');
        Schema::dropIfExists('customer_tariffs');
    }
};
