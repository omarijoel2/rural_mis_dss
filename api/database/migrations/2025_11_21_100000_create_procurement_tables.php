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
        // Vendors/Suppliers Registry - skip if already exists (created by community_stakeholder migration)
        if (!Schema::hasTable('vendors')) {
            Schema::create('vendors', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
                $table->string('vendor_code')->unique();
                $table->string('name');
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->text('address')->nullable();
                $table->enum('category', ['goods', 'services', 'works', 'consultancy'])->default('goods');
                $table->enum('status', ['active', 'suspended', 'blacklisted'])->default('active');
                $table->decimal('performance_score', 5, 2)->default(0)->comment('0-100 score');
                $table->jsonb('meta')->nullable();
                $table->timestamps();
                
                $table->index(['tenant_id', 'status']);
            });
        }

        // Purchase Requisitions
        Schema::create('requisitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('requisition_no')->unique();
            $table->foreignUuid('requestor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('department_id')->nullable();
            $table->date('required_date')->nullable();
            $table->text('justification')->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected', 'cancelled'])->default('draft');
            $table->decimal('total_estimate', 15, 2)->default(0);
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status', 'created_at']);
        });

        // Requisition Line Items
        Schema::create('requisition_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('requisition_id')->constrained('requisitions')->cascadeOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 2);
            $table->string('unit', 50);
            $table->decimal('unit_cost_estimate', 12, 2)->default(0);
            $table->decimal('total_estimate', 15, 2)->default(0);
            $table->unsignedBigInteger('budget_line_id')->nullable();
            $table->jsonb('specifications')->nullable();
            $table->timestamps();
        });

        // Request for Quotation (RFQ)
        Schema::create('rfqs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('rfq_no')->unique();
            $table->foreignUuid('requisition_id')->nullable()->constrained('requisitions')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('issue_date');
            $table->date('submission_deadline');
            $table->enum('status', ['draft', 'issued', 'evaluating', 'awarded', 'cancelled'])->default('draft');
            $table->jsonb('evaluation_criteria')->nullable()->comment('Weights for price, quality, delivery, etc.');
            $table->foreignUuid('awarded_vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // RFQ Line Items
        Schema::create('rfq_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 2);
            $table->string('unit', 50);
            $table->jsonb('specifications')->nullable();
            $table->timestamps();
        });

        // Vendor Invitations for RFQ
        Schema::create('rfq_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->timestamp('invited_at')->useCurrent();
            $table->timestamp('responded_at')->nullable();
            $table->enum('status', ['invited', 'responded', 'declined'])->default('invited');
            $table->timestamps();
            
            $table->unique(['rfq_id', 'vendor_id']);
        });

        // Vendor Bids/Quotes
        Schema::create('bids', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('rfq_id')->constrained('rfqs')->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->decimal('total_bid_amount', 15, 2);
            $table->integer('delivery_days')->nullable();
            $table->text('notes')->nullable();
            $table->jsonb('attachments')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });

        // Bid Line Items
        Schema::create('bid_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('bid_id')->constrained('bids')->cascadeOnDelete();
            $table->foreignUuid('rfq_item_id')->constrained('rfq_items')->cascadeOnDelete();
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 15, 2);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // Bid Evaluation Scores
        Schema::create('bid_evaluations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('bid_id')->constrained('bids')->cascadeOnDelete();
            $table->foreignUuid('evaluator_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('price_score', 5, 2)->default(0);
            $table->decimal('quality_score', 5, 2)->default(0);
            $table->decimal('delivery_score', 5, 2)->default(0);
            $table->decimal('experience_score', 5, 2)->default(0);
            $table->decimal('total_score', 5, 2)->default(0);
            $table->text('comments')->nullable();
            $table->timestamps();
        });

        // Local Purchase Orders (LPO)
        Schema::create('lpos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('lpo_no')->unique();
            $table->foreignUuid('rfq_id')->nullable()->constrained('rfqs')->nullOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->date('order_date');
            $table->date('delivery_date')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->text('terms_conditions')->nullable();
            $table->enum('status', ['draft', 'approved', 'issued', 'delivered', 'cancelled'])->default('draft');
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });

        // LPO Line Items
        Schema::create('lpo_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lpo_id')->constrained('lpos')->cascadeOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 2);
            $table->string('unit', 50);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });

        // Goods Received Notes (GRN)
        Schema::create('grns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lpo_id')->constrained('lpos')->cascadeOnDelete();
            $table->string('grn_no')->unique();
            $table->date('received_date');
            $table->foreignUuid('received_by')->constrained('users')->cascadeOnDelete();
            $table->text('condition_notes')->nullable();
            $table->enum('status', ['full', 'partial', 'rejected'])->default('full');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grns');
        Schema::dropIfExists('lpo_items');
        Schema::dropIfExists('lpos');
        Schema::dropIfExists('bid_evaluations');
        Schema::dropIfExists('bid_items');
        Schema::dropIfExists('bids');
        Schema::dropIfExists('rfq_invitations');
        Schema::dropIfExists('rfq_items');
        Schema::dropIfExists('rfqs');
        Schema::dropIfExists('requisition_items');
        Schema::dropIfExists('requisitions');
        Schema::dropIfExists('vendors');
    }
};
