<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Alter permission tables to support UUID model_id for User model
     */
    public function up(): void
    {
        // model_has_permissions: drop primary key, alter column, recreate
        DB::statement('ALTER TABLE model_has_permissions DROP CONSTRAINT IF EXISTS model_has_permissions_permission_model_type_primary');
        DB::statement('ALTER TABLE model_has_permissions DROP CONSTRAINT IF EXISTS model_has_permissions_pkey');
        DB::statement('DROP INDEX IF EXISTS model_has_permissions_model_id_model_type_index');
        DB::statement('ALTER TABLE model_has_permissions ALTER COLUMN model_id TYPE varchar(36) USING model_id::varchar');
        DB::statement('CREATE INDEX model_has_permissions_model_id_model_type_index ON model_has_permissions (model_id, model_type)');
        DB::statement('ALTER TABLE model_has_permissions ADD PRIMARY KEY (permission_id, model_id, model_type)');

        // model_has_roles: drop primary key, alter column, recreate
        DB::statement('ALTER TABLE model_has_roles DROP CONSTRAINT IF EXISTS model_has_roles_role_model_type_primary');
        DB::statement('ALTER TABLE model_has_roles DROP CONSTRAINT IF EXISTS model_has_roles_pkey');
        DB::statement('DROP INDEX IF EXISTS model_has_roles_model_id_model_type_index');
        DB::statement('ALTER TABLE model_has_roles ALTER COLUMN model_id TYPE varchar(36) USING model_id::varchar');
        DB::statement('CREATE INDEX model_has_roles_model_id_model_type_index ON model_has_roles (model_id, model_type)');
        DB::statement('ALTER TABLE model_has_roles ADD PRIMARY KEY (role_id, model_id, model_type)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // model_has_permissions: revert to bigint
        DB::statement('ALTER TABLE model_has_permissions DROP CONSTRAINT IF EXISTS model_has_permissions_pkey');
        DB::statement('DROP INDEX IF EXISTS model_has_permissions_model_id_model_type_index');
        DB::statement('DELETE FROM model_has_permissions'); // Clear data as UUIDs can't convert to bigint
        DB::statement('ALTER TABLE model_has_permissions ALTER COLUMN model_id TYPE bigint USING 0');
        DB::statement('CREATE INDEX model_has_permissions_model_id_model_type_index ON model_has_permissions (model_id, model_type)');
        DB::statement('ALTER TABLE model_has_permissions ADD PRIMARY KEY (permission_id, model_id, model_type)');

        // model_has_roles: revert to bigint
        DB::statement('ALTER TABLE model_has_roles DROP CONSTRAINT IF EXISTS model_has_roles_pkey');
        DB::statement('DROP INDEX IF EXISTS model_has_roles_model_id_model_type_index');
        DB::statement('DELETE FROM model_has_roles'); // Clear data as UUIDs can't convert to bigint
        DB::statement('ALTER TABLE model_has_roles ALTER COLUMN model_id TYPE bigint USING 0');
        DB::statement('CREATE INDEX model_has_roles_model_id_model_type_index ON model_has_roles (model_id, model_type)');
        DB::statement('ALTER TABLE model_has_roles ADD PRIMARY KEY (role_id, model_id, model_type)');
    }
};
