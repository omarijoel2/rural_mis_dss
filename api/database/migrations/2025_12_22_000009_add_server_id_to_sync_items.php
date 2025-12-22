<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('sync_items', function (Blueprint $table) {
            $table->string('server_id')->nullable()->after('server_version');
        });
    }

    public function down()
    {
        Schema::table('sync_items', function (Blueprint $table) {
            $table->dropColumn('server_id');
        });
    }
};