<?php

namespace App\Http\Controllers\Api\V1\Operations;

use App\Http\Controllers\Controller;
use App\Services\Operations\PlaybookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PlaybookController extends Controller
{
    public function __construct(
        protected PlaybookService $playbookService
    ) {}

    /**
     * Get all playbooks with optional filters.
     * Requires: view playbooks permission
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'for_category' => $request->input('for_category'),
            'for_severity' => $request->input('for_severity'),
            'search' => $request->input('search'),
        ];

        $perPage = (int) $request->input('per_page', 15);
        $playbooks = $this->playbookService->listPlaybooks($request->user(), $filters, $perPage);

        return response()->json($playbooks);
    }

    /**
     * Create a new playbook.
     * Requires: create playbooks permission
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $playbook = $this->playbookService->createPlaybook(
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Playbook created successfully',
                'playbook' => $playbook,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get a specific playbook by ID.
     * Requires: view playbooks permission
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $playbook = $this->playbookService->getPlaybookById($id, $request->user());

            return response()->json([
                'playbook' => $playbook,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Playbook not found',
            ], 404);
        }
    }

    /**
     * Update an existing playbook.
     * Requires: edit playbooks permission
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $playbook = $this->playbookService->updatePlaybook(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Playbook updated successfully',
                'playbook' => $playbook,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Playbook not found',
            ], 404);
        }
    }

    /**
     * Delete a playbook.
     * Requires: delete playbooks permission
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->playbookService->deletePlaybook($id, $request->user());

            return response()->json([
                'message' => 'Playbook deleted successfully',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Playbook not found',
            ], 404);
        }
    }

    /**
     * Find playbooks matching event criteria.
     * Requires: view playbooks permission
     */
    public function findMatching(Request $request): JsonResponse
    {
        $request->validate([
            'category' => 'required|string',
            'severity' => 'required|in:critical,high,medium,low',
        ]);

        $playbooks = $this->playbookService->findMatchingPlaybooks(
            $request->input('category'),
            $request->input('severity'),
            $request->user()
        );

        return response()->json([
            'playbooks' => $playbooks,
        ]);
    }
}
