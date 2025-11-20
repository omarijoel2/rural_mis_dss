<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\ValidatesTenantOwnership;
use App\Models\TelemetryTag;
use App\Models\TelemetryMeasurement;
use App\Services\CoreOps\TelemetryIngestService;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    use ValidatesTenantOwnership;
    
    public function __construct(
        protected TelemetryIngestService $ingestService
    ) {}
    public function tags(Request $request)
    {
        $query = TelemetryTag::query()->with(['scheme', 'asset', 'networkNode']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('asset_id')) {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('io_type')) {
            $query->where('io_type', $request->io_type);
        }

        if ($request->has('enabled')) {
            $query->where('enabled', $request->boolean('enabled'));
        }

        $tags = $query->paginate($request->get('per_page', 50));
        return response()->json($tags);
    }

    public function storeTag(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'asset_id' => 'nullable|uuid|exists:assets,id',
            'network_node_id' => 'nullable|uuid|exists:network_nodes,id',
            'tag' => 'required|string|unique:telemetry_tags,tag',
            'io_type' => 'required|in:AI,DI,DO,AO',
            'unit' => 'nullable|string',
            'scale' => 'nullable|array',
            'thresholds' => 'nullable|array',
            'enabled' => 'nullable|boolean',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        
        // Validate tenant ownership of foreign keys
        $this->validateTenantScheme($validated['scheme_id'] ?? null, $tenantId);
        $this->validateTenantAsset($validated['asset_id'] ?? null, $tenantId);
        $this->validateTenantNode($validated['network_node_id'] ?? null, $tenantId, 'network_node_id');

        $validated['tenant_id'] = $tenantId;

        $tag = TelemetryTag::create($validated);
        return response()->json($tag, 201);
    }

    public function measurements(Request $request)
    {
        $validated = $request->validate([
            'telemetry_tag_id' => 'required|uuid|exists:telemetry_tags,id',
            'from' => 'required|date',
            'to' => 'required|date|after:from',
            'aggregation' => 'nullable|in:raw,avg,min,max',
        ]);

        $query = TelemetryMeasurement::where('telemetry_tag_id', $validated['telemetry_tag_id'])
            ->whereBetween('ts', [$validated['from'], $validated['to']]);

        if ($request->get('aggregation') === 'raw') {
            $measurements = $query->orderBy('ts')->get();
            return response()->json($measurements);
        }

        return response()->json($query->orderBy('ts')->get());
    }

    public function ingest(Request $request)
    {
        $validated = $request->validate([
            'measurements' => 'required|array|max:1000',
            'measurements.*.tag' => 'required|string',
            'measurements.*.ts' => 'required|date',
            'measurements.*.value' => 'required|numeric',
            'measurements.*.meta' => 'nullable|array',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        $result = $this->ingestService->ingestBulk($validated['measurements'], $tenantId);

        return response()->json($result, 201);
    }
}
