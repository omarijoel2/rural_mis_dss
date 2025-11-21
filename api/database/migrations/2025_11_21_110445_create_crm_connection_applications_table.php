<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_connection_applications', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('application_no')->unique();
            $table->string('applicant_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('id_number');
            $table->text('address');
            $table->jsonb('location')->nullable(); // {lat, lng}
            $table->enum('connection_type', ['new', 'upgrade', 'temporary'])->default('new');
            $table->enum('property_type', ['residential', 'commercial', 'industrial'])->default('residential');
            $table->enum('status', ['kyc_pending', 'pending_approval', 'approved', 'rejected', 'connected'])->default('kyc_pending');
            $table->enum('kyc_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->decimal('estimated_cost', 10, 2)->default(0);
            $table->date('applied_date');
            $table->date('approved_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('organizations')->cascadeOnDelete();
            
            $table->index('tenant_id');
            $table->index('application_no');
            $table->index('status');
            $table->index('kyc_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_connection_applications');
    }
};
