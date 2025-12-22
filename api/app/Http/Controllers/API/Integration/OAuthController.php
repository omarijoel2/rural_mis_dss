<?php

namespace App\Http\Controllers\Api\Integration;

use Illuminate\Http\Request;

class OAuthController extends IntegrationBaseController
{
    public function store() { return response()->json(['message' => 'OAuth client created']); }
}
