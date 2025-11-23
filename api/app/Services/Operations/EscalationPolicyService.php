<?php

namespace App\Services\Operations;

use App\Models\EscalationPolicy;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * EscalationPolicyService - Manage event escalation policies and rules
 * 
 * Escalation policies determine who gets notified when events exceed SLA
 * Rules define notification targets based on severity and event categories
 */
class EscalationPolicyService
{
    /**
     * Create a new escalation policy with rules
     *
     * @throws ValidationException
     */
    public function createPolicy(array $data, User $user): EscalationPolicy
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'rules' => 'required|array|min:1',
            'rules.*.severity' => 'required|in:critical,high,medium,low',
            'rules.*.escalate_after_minutes' => 'required|integer|min:1',
            'rules.*.notification_channels' => 'required|array|min:1',
            'rules.*.notification_channels.*' => 'in:email,sms,webhook,push',
            'rules.*.recipients' => 'required|array|min:1',
            'rules.*.recipients.*.type' => 'required|in:user,role,email,phone',
            'rules.*.recipients.*.target' => 'required|string',
            'rules.*.repeat_every_minutes' => 'nullable|integer|min:15',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return EscalationPolicy::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'rules' => $data['rules'],
        ]);
    }

    /**
     * Update an escalation policy
     *
     * @throws ValidationException
     */
    public function updatePolicy(int $policyId, array $data, User $user): EscalationPolicy
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|max:255',
            'rules' => 'sometimes|required|array|min:1',
            'rules.*.severity' => 'required|in:critical,high,medium,low',
            'rules.*.escalate_after_minutes' => 'required|integer|min:1',
            'rules.*.notification_channels' => 'required|array|min:1',
            'rules.*.notification_channels.*' => 'in:email,sms,webhook,push',
            'rules.*.recipients' => 'required|array|min:1',
            'rules.*.recipients.*.type' => 'required|in:user,role,email,phone',
            'rules.*.recipients.*.target' => 'required|string',
            'rules.*.repeat_every_minutes' => 'nullable|integer|min:15',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $policy = EscalationPolicy::where('id', $policyId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $policy->update($data);

        return $policy;
    }

    /**
     * Delete an escalation policy
     */
    public function deletePolicy(int $policyId, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $policy = EscalationPolicy::where('id', $policyId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        return $policy->delete();
    }

    /**
     * Get a specific policy
     */
    public function getPolicyById(int $policyId, User $user): EscalationPolicy
    {
        $tenantId = $user->currentTenantId();

        return EscalationPolicy::where('id', $policyId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();
    }

    /**
     * List all escalation policies
     */
    public function listPolicies(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        $query = EscalationPolicy::where('tenant_id', $tenantId);

        // Search by name
        if (!empty($filters['search'])) {
            $query->where('name', 'ILIKE', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Find matching policy for an event
     * Returns the first applicable policy for a given severity
     */
    public function findApplicablePolicy(string $severity, User $user): ?EscalationPolicy
    {
        $tenantId = $user->currentTenantId();

        $severityOrder = ['critical' => 4, 'high' => 3, 'medium' => 2, 'low' => 1];
        $severityValue = $severityOrder[$severity] ?? 0;

        // Get all policies and check their rules
        $policies = EscalationPolicy::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($policies as $policy) {
            $rules = $policy->rules ?? [];
            foreach ($rules as $rule) {
                $ruleValue = $severityOrder[$rule['severity'] ?? 'low'] ?? 0;
                if ($ruleValue <= $severityValue) {
                    return $policy;
                }
            }
        }

        return null;
    }
}
