<?php

namespace App\Http\Controllers\Api\Hydromet;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hydromet\StoreSourceRequest;
use App\Http\Requests\Hydromet\UpdateSourceRequest;
use App\Http\Requests\Hydromet\LogAbstractionRequest;
use App\Services\Hydromet\SourceService;
use Illuminate\Http\Request;

class SourceController extends Controller
{
    public function __construct(private SourceService $sourceService)
    {
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'kind_id' => 'nullable|exists:source_kinds,id',
            'status_id' => 'nullable|exists:source_statuses,id',
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $sources = $this->sourceService->list(
            $validated['scheme_id'] ?? null,
            $validated['kind_id'] ?? null,
            $validated['status_id'] ?? null,
            $validated['search'] ?? null,
            $validated['per_page'] ?? 50
        );

        return response()->json($sources);
    }

    public function store(StoreSourceRequest $request)
    {
        $source = $this->sourceService->create($request->validated());
        return response()->json($source, 201);
    }

    public function show(string $id)
    {
        $source = $this->sourceService->getById($id);
        return response()->json($source);
    }

    public function update(UpdateSourceRequest $request, string $id)
    {
        $source = $this->sourceService->update($id, $request->validated());
        return response()->json($source);
    }

    public function destroy(string $id)
    {
        $this->sourceService->delete($id);
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
        $sources = $this->sourceService->getSourcesNearPoint($point, $validated['radius'] ?? 10000);

        return response()->json($sources);
    }

    public function inBounds(Request $request)
    {
        $validated = $request->validate([
            'min_lat' => 'required|numeric|min:-90|max:90',
            'min_lon' => 'required|numeric|min:-180|max:180',
            'max_lat' => 'required|numeric|min:-90|max:90',
            'max_lon' => 'required|numeric|min:-180|max:180',
        ]);

        $sources = $this->sourceService->getSourcesInBounds(
            $validated['min_lat'],
            $validated['min_lon'],
            $validated['max_lat'],
            $validated['max_lon']
        );

        return response()->json($sources);
    }

    public function logAbstraction(LogAbstractionRequest $request, string $id)
    {
        $log = $this->sourceService->logAbstraction($id, $request->validated());
        return response()->json($log, 201);
    }

    public function abstractionHistory(Request $request, string $id)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? null ? new \DateTime($validated['start_date']) : null;
        $endDate = $validated['end_date'] ?? null ? new \DateTime($validated['end_date']) : null;

        $history = $this->sourceService->getAbstractionHistory($id, $startDate, $endDate);
        return response()->json($history);
    }

    public function totalAbstraction(Request $request, string $id)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? null ? new \DateTime($validated['start_date']) : null;
        $endDate = $validated['end_date'] ?? null ? new \DateTime($validated['end_date']) : null;

        $total = $this->sourceService->getTotalAbstraction($id, $startDate, $endDate);
        return response()->json(['total_m3' => $total]);
    }

    public function bulkImport(Request $request)
    {
        $validated = $request->validate([
            'sources' => 'required|array|min:1|max:100',
            'sources.*.code' => 'required|string|max:50',
            'sources.*.name' => 'required|string|max:255',
            'sources.*.kind_id' => 'required|exists:source_kinds,id',
            'sources.*.status_id' => 'required|exists:source_statuses,id',
            'sources.*.scheme_id' => 'nullable|uuid|exists:schemes,id',
            'sources.*.catchment' => 'nullable|string|max:255',
            'sources.*.elevation_m' => 'nullable|numeric',
            'sources.*.depth_m' => 'nullable|numeric',
            'sources.*.static_level_m' => 'nullable|numeric',
            'sources.*.dynamic_level_m' => 'nullable|numeric',
            'sources.*.capacity_m3_per_day' => 'nullable|numeric',
            'sources.*.permit_no' => 'nullable|string|max:100',
            'sources.*.permit_expiry' => 'nullable|date',
            'sources.*.quality_risk_id' => 'nullable|exists:quality_risk_levels,id',
            'sources.*.latitude' => 'nullable|numeric|min:-90|max:90',
            'sources.*.longitude' => 'nullable|numeric|min:-180|max:180',
        ]);

        $result = $this->sourceService->bulkImport($validated['sources']);
        
        return response()->json([
            'imported' => $result['imported'],
            'errors' => $result['errors'],
            'sources' => $result['sources'],
        ], $result['imported'] > 0 ? 201 : 422);
    }
}
