<?php

namespace App\Services\Crm;

use App\Models\CrmRaCase;
use App\Models\CrmRaAction;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Collection;

class CaseWorkflowService
{
    public function triageCase(int $caseId, string $decision, ?string $notes, User $user): CrmRaCase
    {
        $tenantId = $user->currentTenantId();

        $case = CrmRaCase::where('tenant_id', $tenantId)->findOrFail($caseId);

        $validator = Validator::make(['decision' => $decision], [
            'decision' => 'required|in:field,close_false_positive,escalate',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $newStatus = match($decision) {
            'field' => 'field',
            'close_false_positive' => 'closed',
            'escalate' => 'field',
        };

        $case->update(['status' => $newStatus]);

        CrmRaAction::create([
            'ra_case_id' => $case->id,
            'action' => $decision === 'close_false_positive' ? 'write_off' : 'dispatch_field',
            'payload' => [
                'decision' => $decision,
                'notes' => $notes,
            ],
            'actor_id' => $user->id,
            'occurred_at' => now(),
        ]);

        return $case->fresh();
    }

    public function dispatchFieldTeam(int $caseId, array $instructions, User $user): CrmRaCase
    {
        $tenantId = $user->currentTenantId();

        $case = CrmRaCase::where('tenant_id', $tenantId)->findOrFail($caseId);

        $validator = Validator::make($instructions, [
            'field_officer' => 'nullable|string|max:255',
            'priority' => 'required|in:routine,urgent',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $case->update(['status' => 'field']);

        CrmRaAction::create([
            'ra_case_id' => $case->id,
            'action' => 'dispatch_field',
            'payload' => $instructions,
            'actor_id' => $user->id,
            'occurred_at' => now(),
        ]);

        return $case->fresh();
    }

    public function requestMeterRead(int $caseId, User $user): CrmRaCase
    {
        $tenantId = $user->currentTenantId();

        $case = CrmRaCase::where('tenant_id', $tenantId)->findOrFail($caseId);

        CrmRaAction::create([
            'ra_case_id' => $case->id,
            'action' => 'request_read',
            'payload' => [
                'requested_at' => now(),
            ],
            'actor_id' => $user->id,
            'occurred_at' => now(),
        ]);

        return $case->fresh();
    }

    public function resolveCase(int $caseId, array $resolution, User $user): CrmRaCase
    {
        $tenantId = $user->currentTenantId();

        $case = CrmRaCase::where('tenant_id', $tenantId)->findOrFail($caseId);

        $validator = Validator::make($resolution, [
            'outcome' => 'required|in:meter_replaced,leak_fixed,tampering_confirmed,billing_adjusted,no_issue_found',
            'notes' => 'nullable|string',
            'amount_recovered' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $case->update([
            'status' => 'resolved',
            'description' => ($case->description ?? '') . "\n\nResolution: {$resolution['outcome']}",
        ]);

        $actionType = match($resolution['outcome']) {
            'meter_replaced' => 'replace_meter',
            'billing_adjusted' => 'bill_adjust',
            'tampering_confirmed' => 'disconnect',
            default => 'write_off',
        };

        CrmRaAction::create([
            'ra_case_id' => $case->id,
            'action' => $actionType,
            'payload' => $resolution,
            'actor_id' => $user->id,
            'occurred_at' => now(),
        ]);

        return $case->fresh();
    }

    public function closeCase(int $caseId, string $reason, User $user): CrmRaCase
    {
        $tenantId = $user->currentTenantId();

        $case = CrmRaCase::where('tenant_id', $tenantId)->findOrFail($caseId);

        $case->update(['status' => 'closed']);

        CrmRaAction::create([
            'ra_case_id' => $case->id,
            'action' => 'write_off',
            'payload' => ['reason' => $reason],
            'actor_id' => $user->id,
            'occurred_at' => now(),
        ]);

        return $case->fresh();
    }

    public function getCasesByStatus(string $status, User $user): Collection
    {
        $tenantId = $user->currentTenantId();

        return CrmRaCase::where('tenant_id', $tenantId)
            ->where('status', $status)
            ->with(['meter', 'premise', 'rule', 'actions'])
            ->orderBy('score', 'desc')
            ->orderBy('detected_at', 'desc')
            ->get();
    }

    public function getHighPriorityCases(int $limit, User $user): Collection
    {
        $tenantId = $user->currentTenantId();

        return CrmRaCase::where('tenant_id', $tenantId)
            ->whereIn('status', ['new', 'triage'])
            ->where('severity', 'high')
            ->orderBy('score', 'desc')
            ->limit($limit)
            ->with(['meter', 'premise', 'rule'])
            ->get();
    }
}
