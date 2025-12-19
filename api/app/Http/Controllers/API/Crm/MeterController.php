<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\MeterService;
use Illuminate\Http\Request;

class MeterController extends Controller
{
    public function __construct(private MeterService $meterService)
    {
    }

    public function store(Request $request)
    {
        $meter = $this->meterService->createMeter($request->all(), auth()->user());
        return response()->json($meter, 201);
    }

    public function reads(int $meterId, Request $request)
    {
        $limit = $request->get('limit', 12);
        $reads = $this->meterService->getMeterReads($meterId, $limit, auth()->user());
        return response()->json($reads);
    }

    public function recordRead(Request $request)
    {
        $read = $this->meterService->recordRead($request->all(), auth()->user());
        return response()->json($read, 201);
    }

    public function anomalies(int $meterId)
    {
        $analysis = $this->meterService->detectAnomalies($meterId, auth()->user());
        return response()->json($analysis);
    }

    public function replace(int $meterId, Request $request)
    {
        $newMeter = $this->meterService->replaceMeter($meterId, $request->all(), auth()->user());
        return response()->json($newMeter, 201);
    }
}
