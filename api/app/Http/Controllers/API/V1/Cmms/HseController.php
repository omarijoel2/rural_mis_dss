<?php

namespace App\Http\Controllers\API\V1\Cmms;

use App\Http\Controllers\Controller;
use App\Services\Cmms\HseService;
use Illuminate\Http\Request;

class HseController extends Controller
{
    public function __construct(protected HseService $hseService)
    {
    }

    public function permits(Request $request)
    {
        $filters = $request->only(['permit_type', 'status', 'work_order_id']);
        $permits = $this->hseService->getAllPermits($filters);
        return response()->json($permits);
    }

    public function storePermit(Request $request)
    {
        $validated = $request->validate([
            'work_order_id' => 'nullable|integer|exists:work_orders,id',
            'permit_type' => 'required|in:hot_work,confined_space,loto,working_at_height,excavation',
            'description' => 'required|string',
            'precautions' => 'nullable|array',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'requested_by' => 'nullable|uuid|exists:users,id'
        ]);

        $permit = $this->hseService->createPermit($validated);
        return response()->json($permit, 201);
    }

    public function showPermit(int $id)
    {
        $permit = $this->hseService->getPermit($id);
        return response()->json($permit);
    }

    public function approvePermit(Request $request, int $id)
    {
        $validated = $request->validate([
            'approved' => 'required|boolean',
            'comments' => 'nullable|string'
        ]);

        $permit = $this->hseService->approvePermit(
            $id,
            $validated['approved'],
            $validated['comments'] ?? null
        );

        return response()->json($permit);
    }

    public function closePermit(int $id)
    {
        $permit = $this->hseService->closePermit($id);
        return response()->json($permit);
    }

    public function storeRiskAssessment(Request $request)
    {
        $validated = $request->validate([
            'work_order_id' => 'nullable|integer|exists:work_orders,id',
            'hazard' => 'required|string',
            'likelihood' => 'required|integer|min:1|max:5',
            'severity' => 'required|integer|min:1|max:5',
            'controls' => 'nullable|array',
            'residual_likelihood' => 'nullable|integer|min:1|max:5',
            'residual_severity' => 'nullable|integer|min:1|max:5'
        ]);

        $assessment = $this->hseService->createRiskAssessment($validated);
        return response()->json($assessment, 201);
    }

    public function updateRiskAssessment(Request $request, int $id)
    {
        $validated = $request->validate([
            'hazard' => 'string',
            'likelihood' => 'integer|min:1|max:5',
            'severity' => 'integer|min:1|max:5',
            'controls' => 'nullable|array',
            'residual_likelihood' => 'nullable|integer|min:1|max:5',
            'residual_severity' => 'nullable|integer|min:1|max:5'
        ]);

        $assessment = $this->hseService->updateRiskAssessment($id, $validated);
        return response()->json($assessment);
    }

    public function incidents(Request $request)
    {
        $filters = $request->only(['severity', 'category', 'status']);
        $incidents = collect();
        return response()->json($incidents);
    }

    public function storeIncident(Request $request)
    {
        $validated = $request->validate([
            'occurred_at' => 'required|date',
            'location' => 'required|string',
            'category' => 'required|in:injury,near_miss,property_damage,environmental,other',
            'severity' => 'required|in:minor,moderate,serious,fatal',
            'description' => 'required|string',
            'immediate_actions' => 'nullable|string',
            'reported_by' => 'nullable|uuid|exists:users,id'
        ]);

        $incident = $this->hseService->createIncident($validated);
        return response()->json($incident, 201);
    }

    public function investigateIncident(Request $request, int $id)
    {
        $validated = $request->validate([
            'root_cause' => 'required|string',
            'corrective_actions' => 'required|string'
        ]);

        $incident = $this->hseService->investigateIncident(
            $id,
            $validated['root_cause'],
            $validated['corrective_actions']
        );

        return response()->json($incident);
    }

    public function closeIncident(int $id)
    {
        $incident = $this->hseService->closeIncident($id);
        return response()->json($incident);
    }

    public function capas(Request $request)
    {
        $filters = $request->only(['status', 'incident_id']);
        
        if ($request->query('overdue') === 'true') {
            $capas = $this->hseService->getOverdueCapas();
        } elseif ($request->query('open') === 'true') {
            $capas = $this->hseService->getOpenCapas();
        } else {
            $capas = collect();
        }
        
        return response()->json($capas);
    }

    public function storeCapa(Request $request)
    {
        $validated = $request->validate([
            'incident_id' => 'nullable|integer|exists:incidents,id',
            'type' => 'required|in:corrective,preventive',
            'description' => 'required|string',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            'due_date' => 'required|date'
        ]);

        $capa = $this->hseService->createCapa($validated);
        return response()->json($capa, 201);
    }

    public function completeCapa(Request $request, int $id)
    {
        $validated = $request->validate([
            'completion_notes' => 'required|string'
        ]);

        $capa = $this->hseService->completeCapa($id, $validated['completion_notes']);
        return response()->json($capa);
    }

    public function incidentStats(Request $request)
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after:from'
        ]);

        $stats = $this->hseService->getIncidentStats($validated['from'], $validated['to']);
        return response()->json($stats);
    }
}
