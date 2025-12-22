<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class DataWarehouseController extends IntegrationBaseController
{
    public function listTables() { return response()->json(['message' => 'DW tables list']); }
    public function lineage($source, $target) { return response()->json(['message' => "Lineage from $source to $target"]); }
    public function qualityMetrics() { return response()->json(['message' => 'DW quality metrics']); }
}
