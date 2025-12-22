<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class BackupController extends IntegrationBaseController
{
    public function createPolicy() { return response()->json(['message' => 'Backup policy created']); }
    public function runBackup($policy) { return response()->json(['message' => "Backup run for policy $policy"]); }
    public function getJob($job) { return response()->json(['message' => "Backup job $job details"]); }
}
