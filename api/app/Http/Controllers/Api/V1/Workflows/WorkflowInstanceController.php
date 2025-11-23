<?php
namespace App\Http\Controllers\Api\V1\Workflows;

use App\Http\Controllers\Controller;
use App\Models\Workflow\WorkflowInstance;
use App\Models\Workflow\WorkflowDefinition;
use App\Services\Workflows\WfRuntime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkflowInstanceController extends Controller
{
    public function __construct(protected WfRuntime $runtime) {}

    public function index(Request $request): JsonResponse
    {
        $query = WorkflowInstance::where('tenant_id', $request->user()->currentTenantId());

        if ($request->has('state')) {
            $query->where('state', $request->input('state'));
        }
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->input('entity_type'));
        }

        $instances = $query->paginate(15);
        return response()->json($instances);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'def_key' => 'required|string',
            'entity_type' => 'required|string',
            'entity_id' => 'required|string',
            'context' => 'nullable|json',
        ]);

        $def = WorkflowDefinition::where('tenant_id', $request->user()->currentTenantId())
            ->where('key', $data['def_key'])
            ->where('active', true)
            ->firstOrFail();

        $instance = WorkflowInstance::create([
            'tenant_id' => $request->user()->currentTenantId(),
            'def_id' => $def->id,
            'entity_type' => $data['entity_type'],
            'entity_id' => $data['entity_id'],
            'state' => $def->spec['states'][0]['name'] ?? 'new',
            'context' => $data['context'] ? json_decode($data['context'], true) : null,
        ]);

        return response()->json($instance, 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $instance = WorkflowInstance::findOrFail($id);
        $this->authorize('view', $instance);
        return response()->json($instance);
    }

    public function trigger(Request $request, $id): JsonResponse
    {
        $instance = WorkflowInstance::findOrFail($id);
        $this->authorize('update', $instance);

        $data = $request->validate([
            'trigger' => 'required|string',
            'payload' => 'nullable|json',
        ]);

        $success = $this->runtime->trigger(
            $instance,
            $data['trigger'],
            $data['payload'] ? json_decode($data['payload'], true) : [],
            $request->user()->id
        );

        if (!$success) {
            return response()->json(['error' => 'Invalid trigger'], 422);
        }

        return response()->json($instance->refresh());
    }
}
