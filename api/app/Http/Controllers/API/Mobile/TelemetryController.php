<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Telemetry;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    public function ingest(Request $req)
    {
        $req->validate([ 'device_id' => 'required|string', 'metrics' => 'required|array' ]);
        $t = Telemetry::create([
            'device_id' => $req->input('device_id'),
            'metrics' => $req->input('metrics'),
        ]);
        // TODO: dispatch aggregator job for analytics
        return response()->json(['accepted' => true], 202);
    }
}
