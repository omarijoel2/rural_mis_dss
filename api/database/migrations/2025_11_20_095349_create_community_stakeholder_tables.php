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
        // RWSS Committees
        Schema::create('committees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('scheme_id')->nullable()->constrained('schemes')->nullOnDelete();
            $table->string('name');
            $table->string('community_name')->nullable();
            $table->jsonb('bylaws')->nullable()->comment('Committee bylaws and constitution');
            $table->date('term_start');
            $table->date('term_end');
            $table->jsonb('quotas')->nullable()->comment('Gender, youth, vulnerable groups quotas');
            $table->enum('status', ['active', 'inactive', 'dissolved'])->default('active');
            $table->date('last_election_date')->nullable();
            $table->decimal('compliance_score', 5, 2)->default(0)->comment('Governance score 0-100');
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['scheme_id', 'status']);
        });

        // Committee Members
        Schema::create('committee_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('committee_id')->constrained('committees')->cascadeOnDelete();
            $table->string('name');
            $table->string('id_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->enum('role', ['chair', 'secretary', 'treasurer', 'auditor', 'member'])->default('member');
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('term_start');
            $table->date('term_end')->nullable();
            $table->string('photo_key')->nullable()->comment('S3 key for photo');
            $table->jsonb('contact_json')->nullable();
            $table->enum('status', ['active', 'inactive', 'resigned'])->default('active');
            $table->timestamps();
            
            $table->index(['tenant_id', 'committee_id']);
            $table->index(['committee_id', 'role', 'status']);
        });

        // Committee Meetings
        Schema::create('committee_meetings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('committee_id')->constrained('committees')->cascadeOnDelete();
            $table->timestamp('scheduled_at');
            $table->string('venue')->nullable();
            $table->jsonb('agenda')->nullable()->comment('Meeting agenda items');
            $table->text('minutes')->nullable()->comment('Rich text minutes');
            $table->jsonb('attendance')->nullable()->comment('Array of member IDs present');
            $table->integer('quorum_required')->default(5);
            $table->integer('members_present')->default(0);
            $table->boolean('quorum_met')->default(false);
            $table->jsonb('resolutions')->nullable()->comment('Decisions and resolutions');
            $table->jsonb('action_items')->nullable()->comment('Action items with owners and due dates');
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();
            
            $table->index(['tenant_id', 'committee_id', 'scheduled_at']);
        });

        // Committee Cashbook
        Schema::create('committee_cashbook', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('committee_id')->constrained('committees')->cascadeOnDelete();
            $table->date('entry_date');
            $table->string('ref_no')->nullable();
            $table->string('particulars');
            $table->enum('entry_type', ['receipt', 'payment'])->default('receipt');
            $table->decimal('amount', 12, 2);
            $table->string('fund_source')->nullable()->comment('Tariff, levy, grant, donation');
            $table->string('ledger_account')->nullable();
            $table->string('attachment_key')->nullable()->comment('S3 key for receipt/voucher');
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'committee_id', 'entry_date']);
        });

        // Committee Audits
        Schema::create('committee_audits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('committee_id')->constrained('committees')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->string('auditor_name')->nullable();
            $table->string('auditor_firm')->nullable();
            $table->jsonb('findings')->nullable()->comment('Audit findings array');
            $table->jsonb('recommendations')->nullable()->comment('Recommendations array');
            $table->enum('opinion', ['unqualified', 'qualified', 'adverse', 'disclaimer'])->nullable();
            $table->enum('status', ['planned', 'in_progress', 'completed'])->default('planned');
            $table->string('report_key')->nullable()->comment('S3 key for audit report');
            $table->timestamps();
            
            $table->index(['tenant_id', 'committee_id']);
        });

        // Vendors
        Schema::create('vendors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('vendor_code')->unique();
            $table->string('company_name');
            $table->string('registration_no')->nullable();
            $table->string('tax_id')->nullable();
            $table->jsonb('profile')->nullable()->comment('Company details, contacts');
            $table->jsonb('kyc')->nullable()->comment('KYC documents and verification');
            $table->jsonb('categories')->nullable()->comment('Service/product categories');
            $table->jsonb('bank_details')->nullable();
            $table->jsonb('certifications')->nullable()->comment('Certificates, licenses');
            $table->decimal('otif_score', 5, 2)->default(100)->comment('On-time in-full delivery %');
            $table->decimal('quality_score', 5, 2)->default(100);
            $table->integer('delivery_count')->default(0);
            $table->enum('status', ['pending', 'approved', 'suspended', 'blacklisted'])->default('pending');
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // RFQ/Bids
        Schema::create('vendor_bids', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('rfq_code');
            $table->string('rfq_title')->nullable();
            $table->jsonb('items')->nullable()->comment('Bid items with quantities and prices');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('currency', 3)->default('KES');
            $table->jsonb('attachments')->nullable()->comment('Bid documents');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('rfq_closes_at')->nullable();
            $table->enum('status', ['draft', 'submitted', 'under_review', 'awarded', 'rejected'])->default('draft');
            $table->jsonb('evaluation')->nullable()->comment('Technical/financial evaluation');
            $table->timestamps();
            
            $table->index(['tenant_id', 'vendor_id']);
            $table->index(['rfq_code', 'status']);
        });

        // Deliveries
        Schema::create('vendor_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('delivery_note_no')->unique();
            $table->string('po_reference')->nullable();
            $table->date('delivery_date');
            $table->jsonb('items')->nullable()->comment('Delivered items with quantities');
            $table->jsonb('documents')->nullable()->comment('GRN, photos, certificates');
            $table->enum('status', ['pending_grn', 'received', 'rejected', 'partial'])->default('pending_grn');
            $table->foreignUuid('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'vendor_id']);
            $table->index(['po_reference']);
        });

        // Vendor Invoices
        Schema::create('vendor_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('invoice_no')->unique();
            $table->string('po_reference')->nullable();
            $table->foreignUuid('delivery_id')->nullable()->constrained('vendor_deliveries')->nullOnDelete();
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('KES');
            $table->string('invoice_file_key')->nullable()->comment('S3 PDF key');
            $table->enum('status', ['submitted', 'verified', 'approved', 'paid', 'rejected'])->default('submitted');
            $table->jsonb('approvals')->nullable()->comment('Approval workflow');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'vendor_id', 'status']);
        });

        // Stakeholders
        Schema::create('stakeholders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['community', 'ngo', 'cbo', 'county_govt', 'regulator', 'vulnerable_group', 'media', 'other'])->default('community');
            $table->jsonb('contact')->nullable()->comment('Email, phone, address');
            $table->jsonb('consent_flags')->nullable()->comment('GDPR consent tracking');
            $table->integer('influence')->default(5)->comment('1-10 scale');
            $table->integer('interest')->default(5)->comment('1-10 scale');
            $table->jsonb('tags')->nullable()->comment('Categorization tags');
            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            
            $table->index(['tenant_id', 'type', 'status']);
        });

        // Stakeholder Engagements
        Schema::create('stakeholder_engagements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->jsonb('audience')->nullable()->comment('Stakeholder IDs or groups');
            $table->enum('channel', ['meeting', 'workshop', 'public_baraza', 'focus_group', 'survey', 'sms', 'radio', 'social_media'])->default('meeting');
            $table->string('venue')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->jsonb('attendance')->nullable()->comment('Check-in tracking');
            $table->integer('attendees_count')->default(0);
            $table->jsonb('outcomes')->nullable()->comment('Meeting outcomes, feedback');
            $table->jsonb('materials')->nullable()->comment('Presentation files, handouts');
            $table->enum('status', ['planned', 'completed', 'cancelled'])->default('planned');
            $table->timestamps();
            
            $table->index(['tenant_id', 'scheduled_at']);
        });
        
        DB::statement('ALTER TABLE stakeholder_engagements ADD COLUMN location geometry(Point,4326)');
        DB::statement('CREATE INDEX engagements_location_idx ON stakeholder_engagements USING GIST (location)');

        // Grievances (GRM)
        Schema::create('grievances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('ticket_no')->unique();
            $table->enum('category', ['water_quality', 'billing', 'service_disruption', 'land_dispute', 'resettlement', 'environmental', 'corruption', 'other'])->default('other');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['new', 'triaged', 'assigned', 'in_progress', 'awaiting_community', 'resolved', 'closed'])->default('new');
            $table->jsonb('reporter')->nullable()->comment('Masked reporter details for privacy');
            $table->enum('channel', ['portal', 'whatsapp', 'sms', 'ussd', 'call', 'walk_in', 'email'])->default('portal');
            $table->text('details')->nullable()->comment('Rich text description');
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sla_due_at')->nullable();
            $table->jsonb('resolution')->nullable()->comment('Resolution details');
            $table->jsonb('evidence')->nullable()->comment('Photos, documents');
            $table->jsonb('signoff')->nullable()->comment('Community sign-off for closure');
            $table->boolean('requires_signoff')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status', 'severity']);
            $table->index(['ticket_no']);
        });
        
        DB::statement('ALTER TABLE grievances ADD COLUMN location geometry(Point,4326)');
        DB::statement('CREATE INDEX grievances_location_idx ON grievances USING GIST (location)');

        // Open Data Datasets
        Schema::create('open_datasets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('license', ['odc_by', 'cc_by_4_0', 'public_domain', 'custom'])->default('cc_by_4_0');
            $table->string('source_ref')->nullable()->comment('Source table/view name');
            $table->jsonb('transform')->nullable()->comment('Data transformation rules');
            $table->string('refresh_cron')->nullable()->comment('Refresh schedule');
            $table->timestamp('last_refreshed_at')->nullable();
            $table->enum('visibility', ['public', 'restricted', 'private'])->default('public');
            $table->string('api_slug')->nullable();
            $table->integer('download_count')->default(0);
            $table->integer('api_call_count')->default(0);
            $table->decimal('rating', 3, 2)->nullable()->comment('User rating 1-5');
            $table->jsonb('schema')->nullable()->comment('Dataset schema/fields');
            $table->timestamps();
            
            $table->index(['tenant_id', 'visibility']);
            $table->index(['slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('open_datasets');
        DB::statement('DROP INDEX IF EXISTS grievances_location_idx');
        Schema::dropIfExists('grievances');
        DB::statement('DROP INDEX IF EXISTS engagements_location_idx');
        Schema::dropIfExists('stakeholder_engagements');
        Schema::dropIfExists('stakeholders');
        Schema::dropIfExists('vendor_invoices');
        Schema::dropIfExists('vendor_deliveries');
        Schema::dropIfExists('vendor_bids');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('committee_audits');
        Schema::dropIfExists('committee_cashbook');
        Schema::dropIfExists('committee_meetings');
        Schema::dropIfExists('committee_members');
        Schema::dropIfExists('committees');
    }
};
