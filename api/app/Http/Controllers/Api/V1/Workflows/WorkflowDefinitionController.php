<?php
namespace App\Http\Controllers\Api\V1\Workflows;

use App\Http\Controllers\Controller;
use App\Models\Workflow\WorkflowDefinition;
use App\Services\Workflows\WfCompiler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkflowDefinitionController extends Controller
{
    public function __construct(protected WfCompiler $compiler) {}

    public function index(Request $request): JsonResponse
    {
        $definitions = WorkflowDefinition::where('tenant_id', $request->user()->currentTenantId())
            ->paginate(15);
        return response()->json($definitions);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => 'required|string|unique:wf_definitions,key',
            'name' => 'required|string',
            'spec' => 'required|json',
        ]);

        if (!$this->compiler->validate(json_decode($data['spec'], true))) {
            return response()->json(['error' => 'Invalid workflow spec'], 422);
        }

        $def = WorkflowDefinition::create([
            'tenant_id' => $request->user()->currentTenantId(),
            ...$data,
            'spec' => json_decode($data['spec'], true),
        ]);

        return response()->json($def, 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $def = WorkflowDefinition::findOrFail($id);
        $this->authorize('view', $def);
        return response()->json($def);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $def = WorkflowDefinition::findOrFail($id);
        $this->authorize('update', $def);

        $data = $request->validate([
            'spec' => 'sometimes|required|json',
        ]);

        if (isset($data['spec'])) {
            $data['spec'] = json_decode($data['spec'], true);
            $def->version++;
        }

        $def->update($data);
        return response()->json($def);
    }

    public function activate(Request $request, $id): JsonResponse
    {
        $def = WorkflowDefinition::findOrFail($id);
        $this->authorize('update', $def);
        $def->update(['active' => true]);
        return response()->json($def);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $def = WorkflowDefinition::findOrFail($id);
        $this->authorize('delete', $def);
        $def->delete();
        return response()->json(['success' => true]);
    }
}
