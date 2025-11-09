<?php

namespace App\Http\Controllers\Api\V1\Operations;

use App\Http\Controllers\Controller;
use App\Services\Operations\ChecklistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ChecklistController extends Controller
{
    public function __construct(
        protected ChecklistService $checklistService
    ) {}

    /**
     * Get all checklists with optional filters.
     * Requires: view checklists permission
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'frequency' => $request->input('frequency'),
            'search' => $request->input('search'),
        ];

        $perPage = (int) $request->input('per_page', 15);
        $checklists = $this->checklistService->listChecklists($request->user(), $filters, $perPage);

        return response()->json($checklists);
    }

    /**
     * Create a new checklist template.
     * Requires: create checklists permission
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $checklist = $this->checklistService->createChecklist(
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Checklist created successfully',
                'checklist' => $checklist,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get a specific checklist by ID.
     * Requires: view checklists permission
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $checklist = $this->checklistService->getChecklistById($id, $request->user());

            return response()->json([
                'checklist' => $checklist,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Checklist not found',
            ], 404);
        }
    }

    /**
     * Update an existing checklist template.
     * Requires: edit checklists permission
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $checklist = $this->checklistService->updateChecklist(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Checklist updated successfully',
                'checklist' => $checklist,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Checklist not found',
            ], 404);
        }
    }

    /**
     * Delete a checklist template.
     * Requires: delete checklists permission
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->checklistService->deleteChecklist($id, $request->user());

            return response()->json([
                'message' => 'Checklist deleted successfully',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Checklist not found',
            ], 404);
        }
    }

    /**
     * Get all checklist runs with filters.
     * Requires: view checklist runs permission
     */
    public function runs(Request $request): JsonResponse
    {
        $filters = [
            'checklist_id' => $request->input('checklist_id'),
            'shift_id' => $request->input('shift_id'),
            'facility_id' => $request->input('facility_id'),
            'performed_by' => $request->input('performed_by'),
            'status' => $request->input('status'),
        ];

        $perPage = (int) $request->input('per_page', 15);
        $runs = $this->checklistService->listRuns($request->user(), $filters, $perPage);

        return response()->json($runs);
    }

    /**
     * Start a new checklist run.
     * Requires: create checklist runs permission
     */
    public function startRun(Request $request, int $id): JsonResponse
    {
        try {
            $run = $this->checklistService->startRun(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Checklist run started successfully',
                'run' => $run,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Checklist not found',
            ], 404);
        }
    }

    /**
     * Update a checklist run (submit answers).
     * Requires: edit checklist runs permission
     */
    public function updateRun(Request $request, int $id): JsonResponse
    {
        try {
            $run = $this->checklistService->updateRun(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Checklist run updated successfully',
                'run' => $run,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Checklist run not found',
            ], 404);
        }
    }

    /**
     * Complete a checklist run.
     * Requires: edit checklist runs permission
     */
    public function completeRun(Request $request, int $id): JsonResponse
    {
        try {
            $run = $this->checklistService->completeRun($id, $request->user());

            return response()->json([
                'message' => 'Checklist run completed successfully',
                'run' => $run,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Checklist run not found',
            ], 404);
        }
    }
}
