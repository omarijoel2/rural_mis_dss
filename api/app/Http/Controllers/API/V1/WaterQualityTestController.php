<?php

namespace App\Http\Controllers\API\V1;

use App\Models\WaterQualityTest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WaterQualityTestController extends Controller
{
    /**
     * List water quality tests for active tenant
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        
        $tests = WaterQualityTest::where('tenant_id', $tenantId)
            ->orderBy('test_date', 'desc')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => $tests->items(),
            'meta' => [
                'total' => $tests->total(),
                'per_page' => $tests->perPage(),
                'current_page' => $tests->currentPage(),
            ]
        ]);
    }

    /**
     * Create water quality test
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        
        $validated = $request->validate([
            'sample_id' => 'required|string',
            'location' => 'required|string',
            'ph' => 'nullable|numeric',
            'turbidity' => 'nullable|numeric',
            'chlorine' => 'nullable|numeric',
            'e_coli' => 'nullable|string',
            'test_date' => 'required|date',
            'tested_by' => 'required|string',
        ]);

        $test = WaterQualityTest::create([
            ...$validated,
            'tenant_id' => $tenantId,
        ]);

        return response()->json([
            'data' => $test
        ], 201);
    }

    /**
     * Get single water quality test
     */
    public function show(WaterQualityTest $waterQualityTest): JsonResponse
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        
        if ($waterQualityTest->tenant_id !== $tenantId) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'data' => $waterQualityTest
        ]);
    }

    /**
     * Update water quality test
     */
    public function update(Request $request, WaterQualityTest $waterQualityTest): JsonResponse
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        
        if ($waterQualityTest->tenant_id !== $tenantId) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'sample_id' => 'sometimes|string',
            'location' => 'sometimes|string',
            'ph' => 'nullable|numeric',
            'turbidity' => 'nullable|numeric',
            'chlorine' => 'nullable|numeric',
            'e_coli' => 'nullable|string',
            'test_date' => 'sometimes|date',
            'tested_by' => 'sometimes|string',
        ]);

        $waterQualityTest->update($validated);

        return response()->json([
            'data' => $waterQualityTest
        ]);
    }

    /**
     * Delete water quality test
     */
    public function destroy(WaterQualityTest $waterQualityTest): JsonResponse
    {
        $tenantId = auth()->user()->active_tenant_id ?? auth()->user()->tenant_id;
        
        if ($waterQualityTest->tenant_id !== $tenantId) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $waterQualityTest->delete();

        return response()->json(null, 204);
    }
}
