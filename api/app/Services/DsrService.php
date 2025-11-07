<?php

namespace App\Services;

use App\Models\DsrRequest;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DsrService
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Create a DSR request
     */
    public function createRequest(
        string $requestType,
        string $subjectEmail,
        string $subjectName,
        ?array $details = null,
        ?User $requester = null
    ): DsrRequest {
        $request = DsrRequest::create([
            'tenant_id' => $requester?->current_tenant_id,
            'requester_id' => $requester?->id,
            'request_type' => $requestType,
            'status' => 'pending',
            'subject_email' => $subjectEmail,
            'subject_name' => $subjectName,
            'details' => $details ?? [],
            'submitted_at' => now(),
        ]);

        $this->auditService->log(
            'dsr.request.created',
            $requester?->id,
            DsrRequest::class,
            $request->id,
            [
                'request_type' => $requestType,
                'subject_email' => $subjectEmail,
            ]
        );

        return $request;
    }

    /**
     * Process data access request (export user data)
     */
    public function processAccessRequest(DsrRequest $request): array
    {
        $request->markInProgress();

        $subject = User::where('email', $request->subject_email)->first();

        if (!$subject) {
            return ['error' => 'Subject not found'];
        }

        $userData = [
            'user' => $subject->only(['id', 'name', 'email', 'created_at']),
            'audit_events' => $subject->auditEvents()->get(),
            'consents' => $subject->consents()->get(),
            'api_keys' => $subject->apiKeys()->get(),
            'trusted_devices' => $subject->trustedDevices()->get(),
        ];

        return $userData;
    }

    /**
     * Process data deletion request (right to be forgotten)
     */
    public function processDeletionRequest(DsrRequest $request, User $fulfilledBy): void
    {
        $request->markInProgress();

        $subject = User::where('email', $request->subject_email)->first();

        if (!$subject) {
            $request->reject($fulfilledBy, 'Subject not found');
            return;
        }

        DB::beginTransaction();
        try {
            $subject->apiKeys()->delete();
            $subject->trustedDevices()->delete();
            $subject->consents()->delete();
            
            $subject->forceDelete();

            $request->markCompleted($fulfilledBy, 'User data deleted successfully');
            
            DB::commit();

            $this->auditService->log(
                'dsr.deletion.completed',
                $fulfilledBy->id,
                User::class,
                $subject->id,
                ['subject_email' => $request->subject_email],
                'warning'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            $request->reject($fulfilledBy, 'Deletion failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Process data rectification request
     */
    public function processRectificationRequest(DsrRequest $request, array $updates, User $fulfilledBy): void
    {
        $request->markInProgress();

        $subject = User::where('email', $request->subject_email)->first();

        if (!$subject) {
            $request->reject($fulfilledBy, 'Subject not found');
            return;
        }

        DB::beginTransaction();
        try {
            $subject->update($updates);

            $request->markCompleted($fulfilledBy, 'User data updated successfully');
            
            DB::commit();

            $this->auditService->log(
                'dsr.rectification.completed',
                $fulfilledBy->id,
                User::class,
                $subject->id,
                ['updates' => array_keys($updates)]
            );
        } catch (\Exception $e) {
            DB::rollBack();
            $request->reject($fulfilledBy, 'Rectification failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get pending DSR requests
     */
    public function getPendingRequests(?string $tenantId = null): Collection
    {
        $query = DsrRequest::pending();

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        return $query->with('requester')->orderBy('submitted_at')->get();
    }

    /**
     * Get DSR request by ID
     */
    public function getRequest(string $id): ?DsrRequest
    {
        return DsrRequest::with(['requester', 'fulfilledBy'])->find($id);
    }

    /**
     * Reject DSR request
     */
    public function rejectRequest(DsrRequest $request, User $fulfilledBy, string $reason): void
    {
        $request->reject($fulfilledBy, $reason);

        $this->auditService->log(
            'dsr.request.rejected',
            $fulfilledBy->id,
            DsrRequest::class,
            $request->id,
            ['reason' => $reason],
            'warning'
        );
    }
}
