<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\ValidatesTenantOwnership;
use App\Models\NetworkNode;
use App\Models\NetworkEdge;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Objects\LineString;

class TopologyController extends Controller
{
    use ValidatesTenantOwnership;
    public function nodes(Request $request)
    {
        $query = NetworkNode::query()->with(['scheme', 'dma', 'facility']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('dma_id')) {
            $query->where('dma_id', $request->dma_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        $nodes = $query->paginate($request->get('per_page', 50));
        return response()->json($nodes);
    }

    public function storeNode(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'facility_id' => 'nullable|uuid|exists:facilities,id',
            'code' => 'required|string|max:32',
            'name' => 'nullable|string',
            'type' => 'required|in:source,wtp,reservoir,junction,customer_node,valve,pump',
            'elevation_m' => 'nullable|numeric',
            'pressure_bar' => 'nullable|numeric',
            'geom' => 'required|array',
            'props' => 'nullable|array',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        
        // Validate tenant ownership of foreign keys
        $this->validateTenantScheme($validated['scheme_id'], $tenantId);
        $this->validateTenantDma($validated['dma_id'] ?? null, $tenantId);
        $this->validateTenantFacility($validated['facility_id'] ?? null, $tenantId);

        $validated['tenant_id'] = $tenantId;
        
        if (isset($validated['geom'])) {
            $validated['geom'] = Point::fromJson(json_encode($validated['geom']));
        }

        $node = NetworkNode::create($validated);
        $node->load(['scheme', 'dma', 'facility']);

        return response()->json($node, 201);
    }

    public function edges(Request $request)
    {
        $query = NetworkEdge::query()->with(['scheme', 'dma', 'fromNode', 'toNode']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('dma_id')) {
            $query->where('dma_id', $request->dma_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $edges = $query->paginate($request->get('per_page', 50));
        return response()->json($edges);
    }

    public function storeEdge(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'from_node_id' => 'required|uuid|exists:network_nodes,id',
            'to_node_id' => 'required|uuid|exists:network_nodes,id',
            'code' => 'nullable|string|max:32',
            'type' => 'required|in:pipe,valve,pump_link',
            'material' => 'nullable|in:uPVC,HDPE,DI,AC,GI,Steel,Other',
            'diameter_mm' => 'nullable|integer',
            'length_m' => 'nullable|numeric',
            'install_year' => 'nullable|integer',
            'status' => 'nullable|in:active,inactive,abandoned',
            'geom' => 'required|array',
            'props' => 'nullable|array',
        ]);

        $tenantId = auth()->user()->currentTenantId();
        
        // Validate tenant ownership of foreign keys
        $this->validateTenantScheme($validated['scheme_id'], $tenantId);
        $this->validateTenantDma($validated['dma_id'] ?? null, $tenantId);
        $this->validateTenantNode($validated['from_node_id'], $tenantId, 'from_node_id');
        $this->validateTenantNode($validated['to_node_id'], $tenantId, 'to_node_id');

        $validated['tenant_id'] = $tenantId;
        
        if (isset($validated['geom'])) {
            $validated['geom'] = LineString::fromJson(json_encode($validated['geom']));
        }

        $edge = NetworkEdge::create($validated);
        $edge->load(['scheme', 'dma', 'fromNode', 'toNode']);

        return response()->json($edge, 201);
    }

    public function traceUpstream(Request $request, NetworkNode $node)
    {
        $maxDepth = $request->get('max_depth', 10);
        $visited = [];
        $trace = $this->traceUpstreamRecursive($node, 0, $maxDepth, $visited);

        return response()->json([
            'start_node' => $node,
            'trace' => $trace,
        ]);
    }

    private function traceUpstreamRecursive(NetworkNode $node, int $depth, int $maxDepth, array &$visited)
    {
        if ($depth >= $maxDepth || in_array($node->id, $visited)) {
            return [];
        }

        $visited[] = $node->id;
        $trace = [];

        foreach ($node->incomingEdges as $edge) {
            $trace[] = [
                'edge' => $edge,
                'from_node' => $edge->fromNode,
                'depth' => $depth,
                'upstream' => $this->traceUpstreamRecursive($edge->fromNode, $depth + 1, $maxDepth, $visited),
            ];
        }

        return $trace;
    }
}
