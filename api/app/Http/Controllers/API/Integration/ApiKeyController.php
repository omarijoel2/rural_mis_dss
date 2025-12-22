<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class ApiKeyController extends IntegrationBaseController
{
    public function index() { return response()->json(['message' => 'API key list']); }
    public function store() { return response()->json(['message' => 'API key created']); }
    public function rotate($id) { return response()->json(['message' => "API key $id rotated"]); }
    public function destroy($id) { return response()->json(['message' => "API key $id deleted"]); }
}
