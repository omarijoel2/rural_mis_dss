<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmServiceConnection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConnectionController extends Controller
{
    public function applications(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        // Mock application data (replace with actual applications table)
        $applications = collect([
            [
                'id' => 1,
                'application_no' => 'APP-2024-001',
                'applicant_name' => 'Jane Doe',
                'phone' => '+254712345678',
                'address' => 'Plot 123, Nairobi Road',
                'status' => 'pending_approval',
                'estimated_cost' => 25000,
                'applied_date' => now()->subDays(5)->format('Y-m-d'),
                'kyc_status' => 'verified',
            ],
            [
                'id' => 2,
                'application_no' => 'APP-2024-002',
                'applicant_name' => 'John Smith',
                'phone' => '+254723456789',
                'address' => 'Plot 456, Kenyatta Avenue',
                'status' => 'approved',
                'estimated_cost' => 32000,
                'applied_date' => now()->subDays(10)->format('Y-m-d'),
                'kyc_status' => 'verified',
            ],
            [
                'id' => 3,
                'application_no' => 'APP-2024-003',
                'applicant_name' => 'Sarah Mwangi',
                'phone' => '+254734567890',
                'address' => 'Plot 789, Uhuru Highway',
                'status' => 'kyc_pending',
                'estimated_cost' => 28500,
                'applied_date' => now()->subDays(2)->format('Y-m-d'),
                'kyc_status' => 'pending',
            ],
        ]);

        if ($request->has('status')) {
            $applications = $applications->where('status', $request->input('status'));
        }

        return response()->json([
            'data' => $applications->values(),
            'total' => $applications->count(),
            'per_page' => $perPage,
            'current_page' => 1,
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

        // Mock application creation
        $application = [
            'id' => rand(100, 999),
            'application_no' => 'APP-' . now()->format('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
            ...$validated,
            'status' => 'kyc_pending',
            'estimated_cost' => rand(20000, 50000),
            'applied_date' => now()->format('Y-m-d'),
            'kyc_status' => 'pending',
        ];

        return response()->json($application, 201);
    }

    public function updateApplication(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:kyc_pending,pending_approval,approved,rejected,connected',
            'kyc_status' => 'sometimes|in:pending,verified,rejected',
            'notes' => 'nullable|string',
        ]);

        return response()->json([
            'id' => $id,
            'message' => 'Application updated successfully',
            ...$validated,
            'updated_at' => now()->toIso8601String(),
        ]);
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
        
        // Update connection status
        $connection->update([
            'status' => 'disconnected',
            'disconnected_at' => $validated['scheduled_date'],
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
            'disconnected_at' => null,
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
}
