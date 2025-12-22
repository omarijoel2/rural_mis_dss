<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class EdrmsController extends IntegrationBaseController
{
    public function store() { return response()->json(['message' => 'Document uploaded']); }
    public function show($id) { return response()->json(['message' => "Document $id details"]); }
}
