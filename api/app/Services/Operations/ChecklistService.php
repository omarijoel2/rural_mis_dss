<?php

namespace App\Services\Operations;

use App\Models\Checklist;
use App\Models\ChecklistRun;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ChecklistService
{
    /**
     * Create a new checklist template.
     *
     * @throws ValidationException
     */
    public function createChecklist(array $data, User $user): Checklist
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'title' => 'required|string|max:255',
            'frequency' => 'nullable|in:daily,weekly,monthly,shift_start,shift_end,on_demand',
            'schema' => 'required|array',
            'schema.*.question' => 'required|string',
            'schema.*.type' => 'required|in:boolean,text,number,choice,rating',
            'schema.*.required' => 'nullable|boolean',
            'schema.*.options' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return Checklist::create([
            'tenant_id' => $tenantId,
            'title' => $data['title'],
            'frequency' => $data['frequency'] ?? null,
            'schema' => $data['schema'],
        ]);
    }

    /**
     * Update an existing checklist template.
     *
     * @throws ValidationException
     */
    public function updateChecklist(int $checklistId, array $data, User $user): Checklist
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'title' => 'sometimes|required|string|max:255',
            'frequency' => 'nullable|in:daily,weekly,monthly,shift_start,shift_end,on_demand',
            'schema' => 'sometimes|required|array',
            'schema.*.question' => 'required|string',
            'schema.*.type' => 'required|in:boolean,text,number,choice,rating',
            'schema.*.required' => 'nullable|boolean',
            'schema.*.options' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $checklist = Checklist::where('id', $checklistId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $checklist->update($data);

        return $checklist;
    }

    /**
     * Delete a checklist template.
     */
    public function deleteChecklist(int $checklistId, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $checklist = Checklist::where('id', $checklistId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // Check if there are any runs
        $runCount = $checklist->runs()->count();
        if ($runCount > 0) {
            throw ValidationException::withMessages([
                'checklist' => ["Cannot delete checklist with {$runCount} existing runs."]
            ]);
        }

        return $checklist->delete();
    }

    /**
     * Get a specific checklist by ID.
     */
    public function getChecklistById(int $checklistId, User $user): Checklist
    {
        $tenantId = $user->currentTenantId();

        return Checklist::where('id', $checklistId)
            ->where('tenant_id', $tenantId)
            ->with('runs')
            ->firstOrFail();
    }

    /**
     * Get all checklists with optional filters.
     */
    public function listChecklists(User $user, array $filters = [], int $perPage = 15)
    {
        $tenantId = $user->currentTenantId();

        $query = Checklist::where('tenant_id', $tenantId);

        // Apply filters
        if (!empty($filters['frequency'])) {
            $query->where('frequency', $filters['frequency']);
        }

        if (!empty($filters['search'])) {
            $query->where('title', 'ILIKE', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('title')->paginate($perPage);
    }

    /**
     * Start a new checklist run.
     *
     * @throws ValidationException
     */
    public function startRun(int $checklistId, array $data, User $user): ChecklistRun
    {
        $validator = Validator::make($data, [
            'shift_id' => 'nullable|integer|exists:shifts,id',
            'facility_id' => 'nullable|uuid|exists:facilities,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Get checklist (will auto-scope by tenant via global scope)
        $checklist = Checklist::findOrFail($checklistId);

        return ChecklistRun::create([
            'checklist_id' => $checklist->id,
            'shift_id' => $data['shift_id'] ?? null,
            'facility_id' => $data['facility_id'] ?? null,
            'performed_by' => $user->id,
            'started_at' => now(),
            'data' => [],
            'score' => null,
        ]);
    }

    /**
     * Update checklist run data (submit answers).
     *
     * @throws ValidationException
     */
    public function updateRun(int $runId, array $data, User $user): ChecklistRun
    {
        $validator = Validator::make($data, [
            'data' => 'required|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $run = ChecklistRun::findOrFail($runId);

        // Verify user owns this run
        if ($run->performed_by !== $user->id) {
            throw ValidationException::withMessages([
                'run' => ['You do not have permission to update this checklist run.']
            ]);
        }

        $run->update([
            'data' => $data['data'],
        ]);

        return $run;
    }

    /**
     * Complete a checklist run.
     *
     * @throws ValidationException
     */
    public function completeRun(int $runId, User $user): ChecklistRun
    {
        $run = ChecklistRun::with('checklist')->findOrFail($runId);

        // Verify user owns this run
        if ($run->performed_by !== $user->id) {
            throw ValidationException::withMessages([
                'run' => ['You do not have permission to complete this checklist run.']
            ]);
        }

        if ($run->completed_at) {
            throw ValidationException::withMessages([
                'run' => ['This checklist run is already completed.']
            ]);
        }

        // Calculate score based on completed items
        $score = $this->calculateScore($run);

        $run->update([
            'completed_at' => now(),
            'score' => $score,
        ]);

        return $run;
    }

    /**
     * Calculate score for a checklist run.
     * Simple scoring: percentage of required questions answered.
     */
    protected function calculateScore(ChecklistRun $run): float
    {
        $schema = $run->checklist->schema ?? [];
        $data = $run->data ?? [];

        if (empty($schema)) {
            return 100.0;
        }

        $totalRequired = 0;
        $answeredRequired = 0;

        foreach ($schema as $index => $field) {
            $isRequired = $field['required'] ?? false;
            if ($isRequired) {
                $totalRequired++;
                if (isset($data[$index]) && !empty($data[$index])) {
                    $answeredRequired++;
                }
            }
        }

        if ($totalRequired === 0) {
            return 100.0;
        }

        return round(($answeredRequired / $totalRequired) * 100, 2);
    }

    /**
     * Get checklist runs with filters.
     */
    public function listRuns(User $user, array $filters = [], int $perPage = 15)
    {
        $query = ChecklistRun::with(['checklist', 'shift', 'facility', 'performer']);

        // Filter by user's tenant through checklist relationship
        $query->whereHas('checklist', function ($q) use ($user) {
            $q->where('tenant_id', $user->currentTenantId());
        });

        // Apply filters
        if (!empty($filters['checklist_id'])) {
            $query->where('checklist_id', $filters['checklist_id']);
        }

        if (!empty($filters['shift_id'])) {
            $query->where('shift_id', $filters['shift_id']);
        }

        if (!empty($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (!empty($filters['performed_by'])) {
            $query->where('performed_by', $filters['performed_by']);
        }

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'completed') {
                $query->whereNotNull('completed_at');
            } elseif ($filters['status'] === 'in_progress') {
                $query->whereNull('completed_at');
            }
        }

        return $query->orderBy('started_at', 'desc')->paginate($perPage);
    }
}
