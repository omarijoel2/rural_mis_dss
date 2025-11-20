<?php

namespace App\Http\Controllers\API\V1\Cmms;

use App\Http\Controllers\Controller;
use App\Services\Cmms\FleetService;
use Illuminate\Http\Request;

class FleetController extends Controller
{
    public function __construct(protected FleetService $fleetService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['type', 'status', 'home_scheme_id']);
        $fleet = $this->fleetService->getAllFleetAssets($filters);
        return response()->json($fleet);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'registration' => 'required|string|max:50',
            'type' => 'required|in:truck,van,bike,generator,pump,excavator,other',
            'make' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'year' => 'nullable|integer',
            'status' => 'nullable|in:active,maintenance,retired',
            'home_scheme_id' => 'nullable|uuid|exists:schemes,id',
            'operator_id' => 'nullable|uuid|exists:users,id',
            'odometer' => 'nullable|numeric',
            'fuel_type' => 'nullable|string'
        ]);

        $asset = $this->fleetService->createFleetAsset($validated);
        return response()->json($asset, 201);
    }

    public function show(int $id)
    {
        $asset = $this->fleetService->getFleetAsset($id);
        return response()->json($asset);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'registration' => 'string|max:50',
            'type' => 'in:truck,van,bike,generator,pump,excavator,other',
            'make' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'year' => 'nullable|integer',
            'status' => 'in:active,maintenance,retired',
            'home_scheme_id' => 'nullable|uuid|exists:schemes,id',
            'operator_id' => 'nullable|uuid|exists:users,id',
            'odometer' => 'nullable|numeric'
        ]);

        $asset = $this->fleetService->updateFleetAsset($id, $validated);
        return response()->json($asset);
    }

    public function createServiceSchedule(Request $request, int $fleetAssetId)
    {
        $validated = $request->validate([
            'service_type' => 'required|string',
            'interval_km' => 'nullable|integer',
            'interval_days' => 'nullable|integer',
            'next_service_km' => 'nullable|integer',
            'next_service_date' => 'nullable|date'
        ]);

        $schedule = $this->fleetService->createServiceSchedule($fleetAssetId, $validated);
        return response()->json($schedule, 201);
    }

    public function logFuel(Request $request, int $fleetAssetId)
    {
        $validated = $request->validate([
            'odometer' => 'required|numeric',
            'liters' => 'required|numeric',
            'cost' => 'required|numeric',
            'km_since_last' => 'nullable|numeric',
            'filled_at' => 'nullable|date'
        ]);

        $log = $this->fleetService->logFuel($fleetAssetId, $validated);
        return response()->json($log, 201);
    }

    public function logUptime(Request $request, int $fleetAssetId)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'hours_available' => 'required|numeric',
            'hours_down' => 'required|numeric',
            'down_reason' => 'nullable|string'
        ]);

        $log = $this->fleetService->logUptime(
            $fleetAssetId,
            $validated['date'],
            $validated['hours_available'],
            $validated['hours_down'],
            $validated['down_reason'] ?? null
        );

        return response()->json($log, 201);
    }

    public function utilization(Request $request)
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after:from'
        ]);

        $stats = $this->fleetService->getFleetUtilization($validated['from'], $validated['to']);
        return response()->json($stats);
    }

    public function fuelEfficiency(int $fleetAssetId, Request $request)
    {
        $validated = $request->validate([
            'last_n_entries' => 'nullable|integer|min:1|max:50'
        ]);

        $efficiency = $this->fleetService->getFuelEfficiency(
            $fleetAssetId,
            $validated['last_n_entries'] ?? 10
        );

        return response()->json($efficiency);
    }
}
