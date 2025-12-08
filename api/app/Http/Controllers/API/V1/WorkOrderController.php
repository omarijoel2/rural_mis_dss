<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\WorkOrder;
use App\Services\WorkOrderService;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;

class WorkOrderController extends Controller
{
    protected WorkOrderService $workOrderService;

    public function __construct(WorkOrderService $workOrderService)
    {
        $this->workOrderService = $workOrderService;
    }

    public function index(Request $request)
    {
        $query = WorkOrder::with(['asset', 'assignedTo', 'createdBy']);

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('wo_num', 'ilike', "%{$search}%")
                  ->orWhere('title', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $statuses = explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        if ($request->has('kind')) {
            $query->where('kind', $request->kind);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('asset_id')) {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $workOrders = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($workOrders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kind' => 'required|in:pm,cm,emergency,project',
            'asset_id' => 'nullable|integer|exists:assets,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,critical',
            'scheduled_for' => 'nullable|date',
            'assigned_to' => 'nullable|string',
            'pm_policy_id' => 'nullable|integer|exists:pm_policies,id',
            'geom' => 'nullable|array'
        ]);
        
        // Clean up assigned_to if it's not a valid UUID
        if (isset($validated['assigned_to'])) {
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $validated['assigned_to'])) {
                $validated['assigned_to'] = null;
            }
        }

        $validated['tenant_id'] = auth()->user()->currentTenantId();
        $validated['created_by'] = auth()->id();

        if (isset($validated['geom']) && is_array($validated['geom'])) {
            $validated['geom'] = Point::fromJson(json_encode($validated['geom']));
        }

        $workOrder = $this->workOrderService->createWorkOrder($validated);
        $workOrder->load(['asset', 'assignedTo', 'createdBy']);

        return response()->json($workOrder, 201);
    }

    public function show(WorkOrder $workOrder)
    {
        $workOrder->load(['asset', 'assignedTo', 'createdBy', 'woParts.part', 'woLabor.user', 'failures']);
        
        $cost = $this->workOrderService->calculateWorkOrderCost($workOrder->id);
        $workOrder->cost_breakdown = $cost;

        return response()->json($workOrder);
    }

    public function update(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'priority' => 'in:low,medium,high,critical',
            'scheduled_for' => 'nullable|date',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            'geom' => 'nullable|array'
        ]);

        if (isset($validated['geom']) && is_array($validated['geom'])) {
            $validated['geom'] = Point::fromJson(json_encode($validated['geom']));
        }

        $workOrder->update($validated);
        $workOrder->load(['asset', 'assignedTo']);

        return response()->json($workOrder);
    }

    public function destroy(WorkOrder $workOrder)
    {
        $workOrder->delete();
        return response()->json(['message' => 'Work order deleted successfully'], 204);
    }

    public function assign(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'user_id' => 'required|uuid|exists:users,id'
        ]);

        $updated = $this->workOrderService->assignWorkOrder($workOrder->id, $validated['user_id']);
        return response()->json($updated);
    }

    public function start(WorkOrder $workOrder)
    {
        $updated = $this->workOrderService->startWorkOrder($workOrder->id);
        return response()->json($updated);
    }

    public function complete(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'completion_notes' => 'nullable|string'
        ]);

        $updated = $this->workOrderService->completeWorkOrder(
            $workOrder->id,
            $validated['completion_notes'] ?? null
        );
        
        return response()->json($updated);
    }

    public function cancel(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'reason' => 'required|string'
        ]);

        $updated = $this->workOrderService->cancelWorkOrder($workOrder->id, $validated['reason']);
        return response()->json($updated);
    }

    public function addParts(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'parts' => 'required|array',
            'parts.*.part_id' => 'required|integer|exists:parts,id',
            'parts.*.qty' => 'required|numeric|min:0',
            'parts.*.unit_cost' => 'required|numeric|min:0'
        ]);

        $added = $this->workOrderService->addParts($workOrder->id, $validated['parts']);
        return response()->json($added, 201);
    }

    public function addLabor(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
            'hours' => 'required|numeric|min:0',
            'rate' => 'required|numeric|min:0'
        ]);

        $labor = $this->workOrderService->addLabor(
            $workOrder->id,
            $validated['user_id'],
            $validated['hours'],
            $validated['rate']
        );

        return response()->json($labor, 201);
    }

    public function overdue(Request $request)
    {
        $workOrders = $this->workOrderService->getOverdueWorkOrders();
        return response()->json($workOrders);
    }

    public function stats(Request $request)
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after:from'
        ]);

        $from = new \DateTime($validated['from']);
        $to = new \DateTime($validated['to']);

        $stats = $this->workOrderService->getWorkOrderStats($from, $to);
        return response()->json($stats);
    }

    public function approve(WorkOrder $workOrder)
    {
        $updated = $this->workOrderService->approveWorkOrder($workOrder->id);
        return response()->json($updated);
    }

    public function qa(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string'
        ]);

        $updated = $this->workOrderService->qaWorkOrder($workOrder->id, $validated['notes'] ?? null);
        return response()->json($updated);
    }

    public function addChecklist(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'job_plan_id' => 'required|integer|exists:job_plans,id'
        ]);

        $items = $this->workOrderService->addChecklistFromJobPlan($workOrder->id, $validated['job_plan_id']);
        return response()->json($items, 201);
    }

    public function updateChecklistItem(Request $request, int $itemId)
    {
        $validated = $request->validate([
            'result' => 'required|in:pass,fail,na,pending',
            'notes' => 'nullable|string',
            'photo_path' => 'nullable|string'
        ]);

        $item = $this->workOrderService->updateChecklistItem(
            $itemId,
            $validated['result'],
            $validated['notes'] ?? null,
            $validated['photo_path'] ?? null
        );

        return response()->json($item);
    }

    public function addAttachment(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'type' => 'required|in:photo,video,drawing,telemetry_trace,redline,document',
            'file' => 'required|file|max:10240',
            'caption' => 'nullable|string'
        ]);

        $attachment = $this->workOrderService->addAttachment(
            $workOrder->id,
            $validated['type'],
            $request->file('file'),
            $validated['caption'] ?? null
        );

        return response()->json($attachment, 201);
    }

    public function addAssignment(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
            'role' => 'required|in:primary,secondary,supervisor,observer'
        ]);

        $assignment = $this->workOrderService->addAssignment(
            $workOrder->id,
            $validated['user_id'],
            $validated['role']
        );

        return response()->json($assignment, 201);
    }

    public function addComment(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'comment' => 'required|string'
        ]);

        $comment = $this->workOrderService->addComment($workOrder->id, $validated['comment']);
        return response()->json($comment, 201);
    }
}
