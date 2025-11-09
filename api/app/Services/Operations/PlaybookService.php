<?php

namespace App\Services\Operations;

use App\Models\Playbook;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PlaybookService
{
    /**
     * Create a new playbook.
     *
     * @throws ValidationException
     */
    public function createPlaybook(array $data, User $user): Playbook
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'for_category' => 'nullable|string|max:100',
            'for_severity' => 'nullable|in:critical,high,medium,low',
            'steps' => 'required|array',
            'steps.*.title' => 'required|string',
            'steps.*.description' => 'required|string',
            'steps.*.type' => 'nullable|in:manual,automated,decision',
            'steps.*.duration_minutes' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return Playbook::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'for_category' => $data['for_category'] ?? null,
            'for_severity' => $data['for_severity'] ?? null,
            'steps' => $data['steps'],
        ]);
    }

    /**
     * Update an existing playbook.
     *
     * @throws ValidationException
     */
    public function updatePlaybook(int $playbookId, array $data, User $user): Playbook
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|max:255',
            'for_category' => 'nullable|string|max:100',
            'for_severity' => 'nullable|in:critical,high,medium,low',
            'steps' => 'sometimes|required|array',
            'steps.*.title' => 'required|string',
            'steps.*.description' => 'required|string',
            'steps.*.type' => 'nullable|in:manual,automated,decision',
            'steps.*.duration_minutes' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $playbook = Playbook::where('id', $playbookId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $playbook->update($data);

        return $playbook;
    }

    /**
     * Delete a playbook.
     */
    public function deletePlaybook(int $playbookId, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $playbook = Playbook::where('id', $playbookId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        return $playbook->delete();
    }

    /**
     * Get a specific playbook by ID.
     */
    public function getPlaybookById(int $playbookId, User $user): Playbook
    {
        $tenantId = $user->currentTenantId();

        return Playbook::where('id', $playbookId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();
    }

    /**
     * Get all playbooks with optional filters.
     */
    public function listPlaybooks(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        $query = Playbook::where('tenant_id', $tenantId);

        // Apply filters
        if (!empty($filters['for_category'])) {
            $query->where('for_category', $filters['for_category']);
        }

        if (!empty($filters['for_severity'])) {
            $query->where('for_severity', $filters['for_severity']);
        }

        if (!empty($filters['search'])) {
            $query->where('name', 'ILIKE', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Find playbooks matching an event's category and severity.
     */
    public function findMatchingPlaybooks(string $category, string $severity, User $user): array
    {
        $tenantId = $user->currentTenantId();

        return Playbook::where('tenant_id', $tenantId)
            ->where(function ($query) use ($category) {
                $query->where('for_category', $category)
                    ->orWhereNull('for_category');
            })
            ->where(function ($query) use ($severity) {
                $query->where('for_severity', $severity)
                    ->orWhereNull('for_severity');
            })
            ->orderBy('for_severity', 'desc')
            ->orderBy('for_category')
            ->get()
            ->toArray();
    }
}
