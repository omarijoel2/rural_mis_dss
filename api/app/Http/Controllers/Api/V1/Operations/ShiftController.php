<?php

namespace App\Http\Controllers\Api\V1\Operations;

use App\Http\Controllers\Controller;
use App\Services\Operations\ShiftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ShiftController extends Controller
{
    public function __construct(
        protected ShiftService $shiftService
    ) {}

    /**
     * Get active shift and shift history.
     * Requires: view shifts permission
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get active shift
        $activeShift = $this->shiftService->getActiveShift($user);

        // Get shift history with filters
        $filters = [
            'status' => $request->input('status'),
            'supervisor_id' => $request->input('supervisor_id'),
            'facility_id' => $request->input('facility_id'),
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
        ];

        $perPage = (int) $request->input('per_page', 15);
        $history = $this->shiftService->getShiftHistory($user, $filters, $perPage);

        return response()->json([
            'active_shift' => $activeShift,
            'history' => $history,
        ]);
    }

    /**
     * Create a new shift.
     * Requires: create shifts permission
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $shift = $this->shiftService->createShift(
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Shift created successfully',
                'shift' => $shift,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get a specific shift by ID.
     * Requires: view shifts permission
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $shift = $this->shiftService->getShiftById($id, $request->user());

            return response()->json([
                'shift' => $shift,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Shift not found',
            ], 404);
        }
    }

    /**
     * Close an active shift.
     * Requires: edit shifts permission
     */
    public function close(Request $request, string $id): JsonResponse
    {
        try {
            $shift = $this->shiftService->closeShift(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Shift closed successfully',
                'shift' => $shift,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Shift not found',
            ], 404);
        }
    }

    /**
     * Add an entry to a shift.
     * Requires: create shift entries permission
     */
    public function addEntry(Request $request, string $id): JsonResponse
    {
        try {
            $entry = $this->shiftService->addEntry(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Shift entry added successfully',
                'entry' => $entry->load('creator'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Shift not found',
            ], 404);
        }
    }
}
