<?php

namespace App\Http\Controllers\Api\V1\Operations;

use App\Http\Controllers\Controller;
use App\Services\Operations\EscalationPolicyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EscalationPolicyController extends Controller
{
    public function __construct(
        protected EscalationPolicyService $escalationPolicyService
    ) {}

    /**
     * Get all escalation policies
     * Requires: view escalation policies permission
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->input('search'),
        ];

        $perPage = (int) $request->input('per_page', 15);
        $policies = $this->escalationPolicyService->listPolicies($request->user(), $filters, $perPage);

        return response()->json($policies);
    }

    /**
     * Create a new escalation policy
     * Requires: create escalation policies permission
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $policy = $this->escalationPolicyService->createPolicy(
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Escalation policy created successfully',
                'policy' => $policy,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get a specific escalation policy
     * Requires: view escalation policies permission
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $policy = $this->escalationPolicyService->getPolicyById($id, $request->user());

            return response()->json([
                'policy' => $policy,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Escalation policy not found',
            ], 404);
        }
    }

    /**
     * Update an escalation policy
     * Requires: edit escalation policies permission
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $policy = $this->escalationPolicyService->updatePolicy(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'message' => 'Escalation policy updated successfully',
                'policy' => $policy,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Escalation policy not found',
            ], 404);
        }
    }

    /**
     * Delete an escalation policy
     * Requires: delete escalation policies permission
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->escalationPolicyService->deletePolicy($id, $request->user());

            return response()->json([
                'message' => 'Escalation policy deleted successfully',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Escalation policy not found',
            ], 404);
        }
    }
}
