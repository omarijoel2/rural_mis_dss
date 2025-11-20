<?php

namespace App\Http\Controllers\API\V1\Cmms;

use App\Http\Controllers\Controller;
use App\Services\Cmms\ContractorService;
use Illuminate\Http\Request;

class ContractorController extends Controller
{
    public function __construct(protected ContractorService $contractorService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['status', 'type', 'vendor_name']);
        $contracts = $this->contractorService->getAllContracts($filters);
        return response()->json($contracts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_num' => 'nullable|string|max:50',
            'vendor_name' => 'required|string|max:255',
            'type' => 'required|in:maintenance,construction,supply,consulting',
            'scope' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'value' => 'required|numeric',
            'status' => 'nullable|in:draft,active,completed,terminated',
            'sla_response_hours' => 'nullable|numeric',
            'sla_resolution_hours' => 'nullable|numeric'
        ]);

        $contract = $this->contractorService->createContract($validated);
        return response()->json($contract, 201);
    }

    public function show(int $id)
    {
        $contract = $this->contractorService->getContract($id);
        return response()->json($contract);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'vendor_name' => 'string|max:255',
            'type' => 'in:maintenance,construction,supply,consulting',
            'scope' => 'nullable|string',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'value' => 'numeric',
            'status' => 'in:draft,active,completed,terminated',
            'sla_response_hours' => 'nullable|numeric',
            'sla_resolution_hours' => 'nullable|numeric'
        ]);

        $contract = $this->contractorService->updateContract($id, $validated);
        return response()->json($contract);
    }

    public function recordViolation(Request $request, int $contractId)
    {
        $validated = $request->validate([
            'violation_type' => 'required|in:response_time,resolution_time,quality,safety',
            'description' => 'required|string',
            'occurred_at' => 'required|date',
            'severity' => 'required|in:minor,major,critical'
        ]);

        $violation = $this->contractorService->recordViolation($contractId, $validated);
        return response()->json($violation, 201);
    }

    public function recordPayment(Request $request, int $contractId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'invoice_ref' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $payment = $this->contractorService->recordPayment($contractId, $validated);
        return response()->json($payment, 201);
    }

    public function vendorScore(Request $request)
    {
        $validated = $request->validate([
            'vendor_name' => 'required|string',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after:from_date'
        ]);

        $scorecard = $this->contractorService->calculateVendorScore(
            $validated['vendor_name'],
            $validated['from_date'],
            $validated['to_date']
        );

        return response()->json($scorecard);
    }

    public function activeContracts()
    {
        $contracts = $this->contractorService->getActiveContracts();
        return response()->json($contracts);
    }

    public function expiring(Request $request)
    {
        $validated = $request->validate([
            'days_ahead' => 'nullable|integer|min:1|max:365'
        ]);

        $contracts = $this->contractorService->getExpiringContracts($validated['days_ahead'] ?? 30);
        return response()->json($contracts);
    }
}
