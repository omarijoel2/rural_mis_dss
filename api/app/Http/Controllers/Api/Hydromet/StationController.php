<?php

namespace App\Http\Controllers\Api\Hydromet;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hydromet\StoreStationRequest;
use App\Http\Requests\Hydromet\UpdateStationRequest;
use App\Http\Requests\Hydromet\StoreSensorRequest;
use App\Services\Hydromet\StationService;
use Illuminate\Http\Request;

class StationController extends Controller
{
    public function __construct(private StationService $stationService)
    {
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'station_type_id' => 'nullable|exists:station_types,id',
            'active' => 'nullable|boolean',
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $stations = $this->stationService->list(
            $validated['scheme_id'] ?? null,
            $validated['station_type_id'] ?? null,
            isset($validated['active']) ? filter_var($validated['active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null,
            $validated['search'] ?? null,
            $validated['per_page'] ?? 50
        );

        return response()->json($stations);
    }

    public function store(StoreStationRequest $request)
    {
        $station = $this->stationService->create($request->validated());
        return response()->json($station, 201);
    }

    public function show(string $id)
    {
        $station = $this->stationService->getById($id);
        return response()->json($station);
    }

    public function update(UpdateStationRequest $request, string $id)
    {
        $station = $this->stationService->update($id, $request->validated());
        return response()->json($station);
    }

    public function destroy(string $id)
    {
        $this->stationService->delete($id);
        return response()->noContent();
    }

    public function nearby(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|min:-90|max:90',
            'lon' => 'required|numeric|min:-180|max:180',
            'radius' => 'nullable|numeric|min:0|max:100000',
        ]);

        $point = new \MatanYadaev\EloquentSpatial\Objects\Point($validated['lat'], $validated['lon'], 4326);
        $stations = $this->stationService->getStationsNearPoint($point, $validated['radius'] ?? 10000);

        return response()->json($stations);
    }

    public function inBounds(Request $request)
    {
        $validated = $request->validate([
            'min_lat' => 'required|numeric|min:-90|max:90',
            'min_lon' => 'required|numeric|min:-180|max:180',
            'max_lat' => 'required|numeric|min:-90|max:90',
            'max_lon' => 'required|numeric|min:-180|max:180',
        ]);

        $stations = $this->stationService->getStationsInBounds(
            $validated['min_lat'],
            $validated['min_lon'],
            $validated['max_lat'],
            $validated['max_lon']
        );

        return response()->json($stations);
    }

    public function addSensor(StoreSensorRequest $request, string $id)
    {
        $sensor = $this->stationService->addSensor($id, $request->validated());
        return response()->json($sensor, 201);
    }

    public function updateSensor(StoreSensorRequest $request, string $stationId, string $sensorId)
    {
        $sensor = $this->stationService->updateSensor($sensorId, $request->validated());
        return response()->json($sensor);
    }

    public function deleteSensor(string $stationId, string $sensorId)
    {
        $this->stationService->deleteSensor($sensorId);
        return response()->noContent();
    }

    public function sensors(string $id, Request $request)
    {
        $validated = $request->validate([
            'active' => 'nullable|boolean',
        ]);

        $activeOnly = isset($validated['active']) ? filter_var($validated['active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null;
        $sensors = $this->stationService->getSensorsByStation($id, $activeOnly);
        return response()->json($sensors);
    }

    public function activate(string $id)
    {
        $station = $this->stationService->activateStation($id);
        return response()->json($station);
    }

    public function deactivate(string $id)
    {
        $station = $this->stationService->deactivateStation($id);
        return response()->json($station);
    }
}
