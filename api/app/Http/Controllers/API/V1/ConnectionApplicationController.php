<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\ConnectionApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConnectionApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ConnectionApplication::with(['scheme', 'approvedBy']);

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $applications = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'applicant_name' => 'required|string|max:255',
            'applicant_phone' => 'required|string|max:20',
            'applicant_email' => 'nullable|email|max:255',
            'premise_address' => 'required|string',
            'connection_type' => 'required|in:new,upgrade,temporary,reconnection',
            'category' => 'required|in:domestic,commercial,industrial,institutional',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;
        $validated['application_no'] = 'APP-' . strtoupper(substr(md5(uniqid()), 0, 8));
        $validated['status'] = 'submitted';

        $application = ConnectionApplication::create($validated);

        return response()->json(['data' => $application], 201);
    }

    public function show(ConnectionApplication $application): JsonResponse
    {
        $application->load(['scheme', 'approvedBy']);
        return response()->json(['data' => $application]);
    }

    public function update(Request $request, ConnectionApplication $application): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:submitted,approved,payment_pending,in_progress,completed,rejected',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'approved') {
            $validated['approved_by'] = $request->user()->id;
            $validated['approved_at'] = now();
        }

        $application->update($validated);

        return response()->json(['data' => $application]);
    }

    public function destroy(ConnectionApplication $application): JsonResponse
    {
        if (!in_array($application->status, ['submitted', 'rejected'])) {
            return response()->json(['error' => 'Only submitted or rejected applications can be deleted'], 400);
        }

        $application->delete();
        return response()->json(null, 204);
    }
}
