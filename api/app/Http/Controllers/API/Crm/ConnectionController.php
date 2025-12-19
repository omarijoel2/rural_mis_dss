<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmServiceConnection;
use App\Models\CrmConnectionApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConnectionController extends Controller
{
    public function applications(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $paginator = CrmConnectionApplication::query()
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
        ]);
    }

    public function submitApplication(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'applicant_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'id_number' => 'required|string|max:50',
            'address' => 'required|string',
            'location' => 'required|array',
            'location.lat' => 'required|numeric',
            'location.lng' => 'required|numeric',
            'connection_type' => 'required|in:new,upgrade,temporary',
            'property_type' => 'required|in:residential,commercial,industrial',
        ]);

        $application = CrmConnectionApplication::create([
            ...$validated,
            'tenant_id' => auth()->user()->currentTenantId(),
            'estimated_cost' => $this->calculateConnectionCost($validated['property_type']),
        ]);

        return response()->json($application, 201);
    }

    public function updateApplication(Request $request, int $id): JsonResponse
    {
        $application = CrmConnectionApplication::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:kyc_pending,pending_approval,approved,rejected,connected',
            'kyc_status' => 'sometimes|in:pending,verified,rejected',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'approved') {
            $validated['approved_date'] = now();
        }

        $application->update($validated);

        return response()->json($application);
    }

    public function disconnections(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $query = CrmServiceConnection::with(['customer', 'premise'])
            ->where('status', 'disconnected');

        if ($request->has('reason')) {
            $query->where('meta->disconnection_reason', $request->input('reason'));
        }

        return response()->json($query->paginate($perPage));
    }

    public function requestDisconnection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_no' => 'required|exists:crm_service_connections,account_no',
            'reason' => 'required|in:non_payment,customer_request,illegal,maintenance,other',
            'scheduled_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $connection = CrmServiceConnection::where('account_no', $validated['account_no'])->first();
        
        $connection->update([
            'status' => 'disconnected',
            'disconnect_date' => $validated['scheduled_date'],
            'meta' => array_merge($connection->meta ?? [], [
                'disconnection_reason' => $validated['reason'],
                'disconnection_notes' => $validated['notes'] ?? null,
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Disconnection request submitted successfully',
            'account_no' => $validated['account_no'],
            'scheduled_date' => $validated['scheduled_date'],
        ]);
    }

    public function reconnect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_no' => 'required|exists:crm_service_connections,account_no',
            'reconnection_fee' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $connection = CrmServiceConnection::where('account_no', $validated['account_no'])->first();
        
        $connection->update([
            'status' => 'active',
            'disconnect_date' => null,
            'meta' => array_merge($connection->meta ?? [], [
                'reconnected_at' => now()->toIso8601String(),
                'reconnection_fee' => $validated['reconnection_fee'],
                'reconnection_notes' => $validated['notes'] ?? null,
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reconnection completed successfully',
            'account_no' => $validated['account_no'],
        ]);
    }

    private function calculateConnectionCost(string $propertyType): float
    {
        return match ($propertyType) {
            'residential' => 25000,
            'commercial' => 40000,
            'industrial' => 60000,
            default => 30000,
        };
    }
}
