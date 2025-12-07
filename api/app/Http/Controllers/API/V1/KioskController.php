<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Kiosk;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KioskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Kiosk::with(['scheme']);

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        $kiosks = $query->orderBy('name')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $kiosks->items(),
            'meta' => [
                'current_page' => $kiosks->currentPage(),
                'last_page' => $kiosks->lastPage(),
                'per_page' => $kiosks->perPage(),
                'total' => $kiosks->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'dma_id' => 'nullable|uuid|exists:dmas,id',
            'kiosk_code' => 'required|string|unique:kiosks,kiosk_code',
            'name' => 'required|string|max:255',
            'vendor_name' => 'nullable|string|max:255',
            'vendor_phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;

        $kiosk = Kiosk::create($validated);

        return response()->json(['data' => $kiosk], 201);
    }

    public function show(Kiosk $kiosk): JsonResponse
    {
        $kiosk->load(['scheme', 'sales']);
        return response()->json(['data' => $kiosk]);
    }

    public function update(Request $request, Kiosk $kiosk): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'vendor_name' => 'nullable|string|max:255',
            'vendor_phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        $kiosk->update($validated);

        return response()->json(['data' => $kiosk]);
    }

    public function destroy(Kiosk $kiosk): JsonResponse
    {
        $kiosk->delete();
        return response()->json(null, 204);
    }
}
