<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix actuals.project_id type mismatch (unsignedBigInteger → uuid)
        // CRITICAL: Original column type (unsignedBigInteger) is incompatible with projects.id (uuid)
        // No data migration path exists between these types - column must be dropped and recreated
        // WARNING: This will lose any existing project_id values in actuals table
        // Run this migration BEFORE populating actuals table with project references
        if (\DB::table('actuals')->whereNotNull('project_id')->exists()) {
            throw new \Exception('Cannot migrate actuals.project_id: table contains data. Manual data migration required.');
        }
        
        Schema::table('actuals', function (Blueprint $table) {
            $table->dropColumn('project_id');
        });
        
        Schema::table('actuals', function (Blueprint $table) {
            $table->foreignUuid('project_id')->nullable()->after('gl_account_id')->constrained('projects')->nullOnDelete();
        });

        // Add budget_version_id to projects for linking capital budgets
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('budget_version_id')->nullable()->after('revised_budget')->constrained('budget_versions')->nullOnDelete();
        });

        // Add cost_center_id to projects for cost allocation
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('cost_center_id')->nullable()->after('category_id')->constrained('cost_centers')->nullOnDelete();
        });

        // Add gl_account_id and project_id to encumbrances for better tracking
        Schema::table('encumbrances', function (Blueprint $table) {
            $table->foreignId('gl_account_id')->nullable()->after('cost_center_id')->constrained('gl_accounts')->nullOnDelete();
            $table->foreignUuid('project_id')->nullable()->after('gl_account_id')->constrained('projects')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('encumbrances', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
            $table->dropForeign(['gl_account_id']);
            $table->dropColumn('gl_account_id');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['cost_center_id']);
            $table->dropColumn('cost_center_id');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['budget_version_id']);
            $table->dropColumn('budget_version_id');
        });

        Schema::table('actuals', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
        });

        Schema::table('actuals', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->after('gl_account_id');
        });
    }
};
