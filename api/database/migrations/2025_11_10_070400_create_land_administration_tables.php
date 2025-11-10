<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('land_parcels', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('ref_no', 50)->index();
            $table->string('title_number')->nullable();
            $table->string('owner_name');
            $table->string('owner_contact')->nullable();
            $table->enum('title_status', ['freehold', 'leasehold', 'customary', 'government', 'unknown'])->default('unknown');
            $table->geography('boundary', 'polygon');
            $table->decimal('area_ha', 15, 4); // Hectares
            $table->string('county')->nullable();
            $table->string('sub_county')->nullable();
            $table->string('ward')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('land_categories')->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->enum('acquisition_status', ['identified', 'valuation', 'negotiation', 'acquired', 'disputed'])->default('identified');
            $table->text('notes')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->nullOnDelete();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'ref_no']);
            $table->index(['tenant_id', 'acquisition_status']);
            $table->index(['tenant_id', 'project_id']);
            $table->spatialIndex('boundary');
        });

        Schema::create('wayleaves', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->string('wayleave_no', 50)->index();
            $table->enum('type', ['pipeline', 'power_line', 'access_road', 'temporary', 'other']);
            $table->decimal('width_m', 10, 2)->nullable();
            $table->decimal('length_m', 10, 2)->nullable();
            $table->date('agreement_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->enum('status', ['pending', 'active', 'expired', 'terminated', 'disputed'])->default('pending');
            $table->decimal('annual_fee', 15, 2)->nullable();
            $table->text('terms')->nullable();
            $table->jsonb('documents')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'parcel_id']);
            $table->index(['parcel_id', 'status']);
        });

        Schema::create('compensations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->string('comp_no', 50)->index();
            $table->decimal('valuation_amount', 20, 2);
            $table->decimal('negotiated_amount', 20, 2)->nullable();
            $table->decimal('paid_amount', 20, 2)->default(0);
            $table->enum('comp_type', ['land_acquisition', 'crops', 'structures', 'disturbance', 'other']);
            $table->date('valuation_date');
            $table->date('payment_date')->nullable();
            $table->string('payment_reference')->nullable();
            $table->enum('status', ['valued', 'negotiated', 'approved', 'paid', 'disputed'])->default('valued');
            $table->text('valuation_notes')->nullable();
            $table->foreignUuid('valued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'parcel_id']);
            $table->index(['parcel_id', 'status']);
        });

        Schema::create('land_disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->string('dispute_no', 50)->index();
            $table->text('description');
            $table->enum('type', ['ownership', 'boundary', 'compensation', 'wayleave', 'other']);
            $table->date('raised_date');
            $table->date('resolved_date')->nullable();
            $table->enum('status', ['open', 'mediation', 'legal', 'resolved', 'closed'])->default('open');
            $table->string('claimant_name')->nullable();
            $table->string('claimant_contact')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->decimal('settlement_amount', 20, 2)->nullable();
            $table->foreignUuid('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'parcel_id']);
            $table->index(['parcel_id', 'status']);
        });

        Schema::create('land_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->enum('doc_type', ['title_deed', 'valuation_report', 'agreement', 'payment_receipt', 'court_order', 'other']);
            $table->string('file_name');
            $table->string('file_path');
            $table->bigInteger('file_size')->nullable();
            $table->date('document_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignUuid('uploaded_by')->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['parcel_id', 'doc_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('land_documents');
        Schema::dropIfExists('land_disputes');
        Schema::dropIfExists('compensations');
        Schema::dropIfExists('wayleaves');
        Schema::dropIfExists('land_parcels');
    }
};
