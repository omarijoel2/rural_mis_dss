<?php

namespace App\Services\Cmms;

use App\Models\Permit;
use App\Models\PermitApproval;
use App\Models\RiskAssessment;
use App\Models\Incident;
use App\Models\Capa;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HseService
{
    public function getAllPermits(array $filters = []): Collection
    {
        $query = Permit::with(['workOrder', 'requestedBy']);
        
        if (isset($filters['permit_type'])) {
            $query->where('permit_type', $filters['permit_type']);
        }
        
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['work_order_id'])) {
            $query->where('work_order_id', $filters['work_order_id']);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getPermit(int $id): Permit
    {
        return Permit::with(['workOrder', 'requestedBy', 'approvals'])->findOrFail($id);
    }

    public function createPermit(array $data): Permit
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['requested_by'] = $data['requested_by'] ?? auth()->id();
        $data['status'] = 'pending';
        
        return Permit::create($data);
    }

    public function updatePermit(int $id, array $data): Permit
    {
        $permit = Permit::findOrFail($id);
        $permit->update($data);
        return $permit->fresh(['workOrder', 'requestedBy']);
    }

    public function approvePermit(int $permitId, bool $approved, ?string $comments = null): Permit
    {
        return DB::transaction(function () use ($permitId, $approved, $comments) {
            $permit = Permit::findOrFail($permitId);
            
            PermitApproval::create([
                'permit_id' => $permitId,
                'approver_id' => auth()->id(),
                'approved' => $approved,
                'comments' => $comments,
                'approved_at' => now()
            ]);
            
            $newStatus = $approved ? 'approved' : 'rejected';
            $permit->update([
                'status' => $newStatus,
                'approved_by' => $approved ? auth()->id() : null,
                'approved_at' => $approved ? now() : null
            ]);
            
            return $permit->fresh();
        });
    }

    public function closePermit(int $permitId): Permit
    {
        $permit = Permit::findOrFail($permitId);
        
        $permit->update([
            'status' => 'closed',
            'closed_at' => now()
        ]);
        
        return $permit->fresh();
    }

    public function createRiskAssessment(array $data): RiskAssessment
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        
        if (isset($data['likelihood']) && isset($data['severity'])) {
            $data['risk_level'] = $this->calculateRiskLevel($data['likelihood'], $data['severity']);
        }
        
        return RiskAssessment::create($data);
    }

    public function updateRiskAssessment(int $id, array $data): RiskAssessment
    {
        $assessment = RiskAssessment::findOrFail($id);
        
        if (isset($data['likelihood']) && isset($data['severity'])) {
            $data['risk_level'] = $this->calculateRiskLevel($data['likelihood'], $data['severity']);
        }
        
        $assessment->update($data);
        return $assessment->fresh(['workOrder']);
    }

    protected function calculateRiskLevel(int $likelihood, int $severity): string
    {
        $score = $likelihood * $severity;
        
        return match (true) {
            $score >= 15 => 'high',
            $score >= 8 => 'medium',
            default => 'low'
        };
    }

    public function createIncident(array $data): Incident
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['reported_by'] = $data['reported_by'] ?? auth()->id();
        $data['status'] = 'open';
        
        return Incident::create($data);
    }

    public function updateIncident(int $id, array $data): Incident
    {
        $incident = Incident::findOrFail($id);
        $incident->update($data);
        return $incident->fresh(['reportedBy']);
    }

    public function investigateIncident(int $incidentId, string $rootCause, string $correctiveActions): Incident
    {
        $incident = Incident::findOrFail($incidentId);
        
        $incident->update([
            'root_cause' => $rootCause,
            'corrective_actions' => $correctiveActions,
            'investigated_at' => now(),
            'status' => 'investigated'
        ]);
        
        return $incident->fresh();
    }

    public function closeIncident(int $incidentId): Incident
    {
        $incident = Incident::findOrFail($incidentId);
        
        $incident->update([
            'status' => 'closed',
            'closed_at' => now()
        ]);
        
        return $incident->fresh();
    }

    public function createCapa(array $data): Capa
    {
        $data['tenant_id'] = auth()->user()->tenant_id;
        $data['status'] = 'open';
        
        return Capa::create($data);
    }

    public function updateCapa(int $id, array $data): Capa
    {
        $capa = Capa::findOrFail($id);
        $capa->update($data);
        return $capa->fresh(['incident', 'assignedTo']);
    }

    public function completeCapa(int $capaId, string $completionNotes): Capa
    {
        $capa = Capa::findOrFail($capaId);
        
        $capa->update([
            'status' => 'completed',
            'completion_notes' => $completionNotes,
            'completed_at' => now()
        ]);
        
        return $capa->fresh();
    }

    public function getIncidentStats(string $from, string $to): array
    {
        $incidents = Incident::whereBetween('occurred_at', [$from, $to])->get();
        
        $bySeverity = $incidents->groupBy('severity')->map->count();
        $byCategory = $incidents->groupBy('category')->map->count();
        $byStatus = $incidents->groupBy('status')->map->count();
        
        $totalIncidents = $incidents->count();
        $investigatedCount = $incidents->where('status', 'investigated')->count();
        $closedCount = $incidents->where('status', 'closed')->count();
        
        return [
            'period' => ['from' => $from, 'to' => $to],
            'total_incidents' => $totalIncidents,
            'by_severity' => $bySeverity,
            'by_category' => $byCategory,
            'by_status' => $byStatus,
            'investigation_rate' => $totalIncidents > 0 ? round(($investigatedCount / $totalIncidents) * 100, 2) : 0,
            'closure_rate' => $totalIncidents > 0 ? round(($closedCount / $totalIncidents) * 100, 2) : 0
        ];
    }

    public function getOpenCapas(): Collection
    {
        return Capa::with(['incident', 'assignedTo'])
            ->where('status', 'open')
            ->orderBy('due_date')
            ->get();
    }

    public function getOverdueCapas(): Collection
    {
        return Capa::with(['incident', 'assignedTo'])
            ->where('status', 'open')
            ->where('due_date', '<', now())
            ->orderBy('due_date')
            ->get();
    }
}
