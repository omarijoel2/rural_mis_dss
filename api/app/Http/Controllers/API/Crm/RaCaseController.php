<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\RaEngineService;
use App\Services\Crm\CaseWorkflowService;
use Illuminate\Http\Request;

class RaCaseController extends Controller
{
    public function __construct(
        private RaEngineService $raEngineService,
        private CaseWorkflowService $caseWorkflowService
    ) {
    }

    public function index(Request $request)
    {
        $status = $request->get('status', 'new');
        $cases = $this->caseWorkflowService->getCasesByStatus($status, auth()->user());
        return response()->json($cases);
    }

    public function highPriority(Request $request)
    {
        $limit = $request->get('limit', 20);
        $cases = $this->caseWorkflowService->getHighPriorityCases($limit, auth()->user());
        return response()->json($cases);
    }

    public function runRules()
    {
        $result = $this->raEngineService->runAllRules(auth()->user());
        return response()->json($result);
    }

    public function triage(int $caseId, Request $request)
    {
        $request->validate([
            'decision' => 'required|in:field,close_false_positive,escalate',
            'notes' => 'nullable|string',
        ]);

        $case = $this->caseWorkflowService->triageCase(
            $caseId,
            $request->decision,
            $request->notes,
            auth()->user()
        );

        return response()->json($case);
    }

    public function dispatchField(int $caseId, Request $request)
    {
        $case = $this->caseWorkflowService->dispatchFieldTeam($caseId, $request->all(), auth()->user());
        return response()->json($case);
    }

    public function resolve(int $caseId, Request $request)
    {
        $case = $this->caseWorkflowService->resolveCase($caseId, $request->all(), auth()->user());
        return response()->json($case);
    }

    public function close(int $caseId, Request $request)
    {
        $request->validate(['reason' => 'required|string']);
        $case = $this->caseWorkflowService->closeCase($caseId, $request->reason, auth()->user());
        return response()->json($case);
    }
}
