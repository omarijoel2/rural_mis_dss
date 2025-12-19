<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DsrService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DsrController extends Controller
{
    protected DsrService $dsrService;

    public function __construct(DsrService $dsrService)
    {
        $this->dsrService = $dsrService;
    }

    public function index(Request $request)
    {
        $tenantId = $request->user()->current_tenant_id;
        $requests = $this->dsrService->getPendingRequests($tenantId);

        return response()->json(['dsr_requests' => $requests]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'request_type' => 'required|string|in:access,deletion,rectification,portability',
            'subject_email' => 'required|email',
            'subject_name' => 'required|string',
            'details' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $dsrRequest = $this->dsrService->createRequest(
                $request->request_type,
                $request->subject_email,
                $request->subject_name,
                $request->details,
                $request->user()
            );

            return response()->json(['dsr_request' => $dsrRequest], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $dsrRequest = $this->dsrService->getRequest($id);

            if (!$dsrRequest) {
                return response()->json(['message' => 'DSR request not found'], 404);
            }

            return response()->json(['dsr_request' => $dsrRequest]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function processAccess(Request $request, string $id)
    {
        try {
            $dsrRequest = $this->dsrService->getRequest($id);

            if (!$dsrRequest) {
                return response()->json(['message' => 'DSR request not found'], 404);
            }

            $userData = $this->dsrService->processAccessRequest($dsrRequest);

            return response()->json(['user_data' => $userData]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function processDeletion(Request $request, string $id)
    {
        try {
            $dsrRequest = $this->dsrService->getRequest($id);

            if (!$dsrRequest) {
                return response()->json(['message' => 'DSR request not found'], 404);
            }

            $this->dsrService->processDeletionRequest($dsrRequest, $request->user());

            return response()->json(['message' => 'Deletion processed successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function processRectification(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'updates' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $dsrRequest = $this->dsrService->getRequest($id);

            if (!$dsrRequest) {
                return response()->json(['message' => 'DSR request not found'], 404);
            }

            $this->dsrService->processRectificationRequest($dsrRequest, $request->updates, $request->user());

            return response()->json(['message' => 'Rectification processed successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function reject(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            $dsrRequest = $this->dsrService->getRequest($id);

            if (!$dsrRequest) {
                return response()->json(['message' => 'DSR request not found'], 404);
            }

            $this->dsrService->rejectRequest($dsrRequest, $request->user(), $request->reason);

            return response()->json(['message' => 'DSR request rejected']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
