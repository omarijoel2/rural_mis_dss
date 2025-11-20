<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fleet Assets (vehicles, generators, mobile equipment)
        Schema::create('fleet_assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade'); // Link to main assets table
            $table->enum('fleet_type', ['vehicle', 'generator', 'mobile_equipment'])->default('vehicle');
            $table->string('registration')->nullable();
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->integer('year')->nullable();
            $table->string('vin')->nullable();
            $table->decimal('odometer', 10, 2)->default(0); // km or miles
            $table->decimal('hour_meter', 10, 2)->default(0); // engine hours
            $table->decimal('fuel_capacity', 8, 2)->nullable(); // liters
            $table->string('fuel_type')->nullable(); // diesel, petrol, electric
            $table->date('insurance_expiry')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('asset_id');
            $table->index('fleet_type');
            $table->unique('registration');
        });

        // Service Schedules (time & mileage/hour-based)
        Schema::create('service_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fleet_asset_id')->constrained('fleet_assets')->onDelete('cascade');
            $table->string('service_type'); // oil_change, filter_change, inspection, major_service
            $table->text('description')->nullable();
            $table->integer('interval_days')->nullable();
            $table->decimal('interval_km', 10, 2)->nullable();
            $table->decimal('interval_hours', 10, 2)->nullable();
            $table->decimal('last_service_km', 10, 2)->nullable();
            $table->decimal('last_service_hours', 10, 2)->nullable();
            $table->date('last_service_date')->nullable();
            $table->decimal('next_service_km', 10, 2)->nullable();
            $table->decimal('next_service_hours', 10, 2)->nullable();
            $table->date('next_service_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('fleet_asset_id');
            $table->index('next_service_date');
            $table->index('is_active');
        });

        // Fuel Logs
        Schema::create('fuel_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fleet_asset_id')->constrained('fleet_assets')->onDelete('cascade');
            $table->timestampTz('filled_at');
            $table->decimal('volume', 8, 2); // liters
            $table->decimal('cost', 10, 2);
            $table->decimal('odometer', 10, 2)->nullable();
            $table->decimal('unit_price', 8, 2)->nullable(); // cost per liter
            $table->string('receipt_path')->nullable(); // photo of receipt
            $table->uuid('filled_by');
            $table->foreign('filled_by')->references('id')->on('users')->onDelete('restrict');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('fleet_asset_id');
            $table->index('filled_at');
        });

        // Fleet Uptime/Downtime Log
        Schema::create('fleet_uptime_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fleet_asset_id')->constrained('fleet_assets')->onDelete('cascade');
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->onDelete('set null');
            $table->enum('event_type', ['available', 'in_use', 'maintenance', 'breakdown', 'out_of_service'])->default('available');
            $table->timestampTz('started_at');
            $table->timestampTz('ended_at')->nullable();
            $table->decimal('duration_hours', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('fleet_asset_id');
            $table->index('event_type');
            $table->index('started_at');
        });

        // Fleet Assignments (who is using which vehicle)
        Schema::create('fleet_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fleet_asset_id')->constrained('fleet_assets')->onDelete('cascade');
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            $table->timestampTz('assigned_at');
            $table->timestampTz('returned_at')->nullable();
            $table->decimal('odometer_start', 10, 2)->nullable();
            $table->decimal('odometer_end', 10, 2)->nullable();
            $table->text('condition_notes')->nullable();
            $table->timestamps();
            
            $table->index('fleet_asset_id');
            $table->index('user_id');
            $table->index('assigned_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fleet_assignments');
        Schema::dropIfExists('fleet_uptime_log');
        Schema::dropIfExists('fuel_logs');
        Schema::dropIfExists('service_schedules');
        Schema::dropIfExists('fleet_assets');
    }
};
