<?php

namespace App\Services\Operations;

use App\Models\Shift;
use App\Models\ShiftEntry;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use MatanYadaev\EloquentSpatial\Objects\Point;

class ShiftService
{
    /**
     * Create a new shift.
     *
     * @throws ValidationException
     */
    public function createShift(array $data, User $user): Shift
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'facility_id' => 'nullable|uuid|exists:facilities,id',
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'initial_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Check if there's already an active shift
        $activeShift = Shift::where('tenant_id', $user->tenant_id)
            ->where('status', 'active')
            ->first();

        if ($activeShift) {
            throw ValidationException::withMessages([
                'shift' => ['There is already an active shift. Please close it before starting a new one.']
            ]);
        }

        return DB::transaction(function () use ($data, $user) {
            $shift = Shift::create([
                'tenant_id' => $user->tenant_id,
                'facility_id' => $data['facility_id'] ?? null,
                'scheme_id' => $data['scheme_id'] ?? null,
                'dma_id' => $data['dma_id'] ?? null,
                'name' => $data['name'],
                'starts_at' => $data['starts_at'] ?? now(),
                'ends_at' => $data['ends_at'] ?? null,
                'supervisor_id' => $user->id,
                'status' => 'active',
            ]);

            // Add initial shift entry if notes provided
            if (!empty($data['initial_notes'])) {
                ShiftEntry::create([
                    'shift_id' => $shift->id,
                    'kind' => 'note',
                    'title' => 'Shift Started',
                    'body' => $data['initial_notes'],
                    'created_by' => $user->id,
                ]);
            }

            return $shift->load(['supervisor', 'entries']);
        });
    }

    /**
     * Close an active shift.
     *
     * @throws ValidationException
     */
    public function closeShift(string $shiftId, array $data, User $user): Shift
    {
        $validator = Validator::make($data, [
            'handover_notes' => 'nullable|string',
            'ends_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $shift = Shift::where('id', $shiftId)
            ->where('tenant_id', $user->tenant_id)
            ->firstOrFail();

        if ($shift->status !== 'active') {
            throw ValidationException::withMessages([
                'shift' => ['This shift is already closed.']
            ]);
        }

        return DB::transaction(function () use ($shift, $data, $user) {
            // Add handover entry if notes provided
            if (!empty($data['handover_notes'])) {
                ShiftEntry::create([
                    'shift_id' => $shift->id,
                    'kind' => 'handover',
                    'title' => 'Shift Handover Report',
                    'body' => $data['handover_notes'],
                    'created_by' => $user->id,
                ]);
            }

            $shift->update([
                'status' => 'closed',
                'ends_at' => $data['ends_at'] ?? now(),
            ]);

            return $shift->load(['supervisor', 'entries']);
        });
    }

    /**
     * Add an entry to a shift.
     *
     * @throws ValidationException
     */
    public function addEntry(string $shiftId, array $data, User $user): ShiftEntry
    {
        $validator = Validator::make($data, [
            'kind' => 'required|in:note,handover,incident,checklist,event',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'attachments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $shift = Shift::where('id', $shiftId)
            ->where('tenant_id', $user->tenant_id)
            ->firstOrFail();

        $entryData = [
            'shift_id' => $shift->id,
            'kind' => $data['kind'],
            'title' => $data['title'],
            'body' => $data['body'],
            'created_by' => $user->id,
            'tags' => $data['tags'] ?? null,
            'attachments' => $data['attachments'] ?? null,
        ];

        // Add spatial data if coordinates provided
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $entryData['geom'] = new Point($data['latitude'], $data['longitude']);
        }

        return ShiftEntry::create($entryData);
    }

    /**
     * Get the current active shift for the tenant.
     */
    public function getActiveShift(User $user): ?Shift
    {
        return Shift::where('tenant_id', $user->tenant_id)
            ->where('status', 'active')
            ->with(['supervisor', 'facility', 'scheme', 'dma', 'entries.creator'])
            ->first();
    }

    /**
     * Get shift history with pagination.
     */
    public function getShiftHistory(User $user, array $filters = [], int $perPage = 15)
    {
        $query = Shift::where('tenant_id', $user->tenant_id)
            ->with(['supervisor', 'facility', 'scheme', 'dma']);

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['supervisor_id'])) {
            $query->where('supervisor_id', $filters['supervisor_id']);
        }

        if (!empty($filters['facility_id'])) {
            $query->where('facility_id', $filters['facility_id']);
        }

        if (!empty($filters['from_date'])) {
            $query->where('starts_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->where('starts_at', '<=', $filters['to_date']);
        }

        return $query->orderBy('starts_at', 'desc')->paginate($perPage);
    }

    /**
     * Get a specific shift by ID with all entries.
     */
    public function getShiftById(string $shiftId, User $user): Shift
    {
        return Shift::where('id', $shiftId)
            ->where('tenant_id', $user->tenant_id)
            ->with([
                'supervisor',
                'facility',
                'scheme',
                'dma',
                'entries.creator',
                'checklistRuns.checklist'
            ])
            ->firstOrFail();
    }
}
