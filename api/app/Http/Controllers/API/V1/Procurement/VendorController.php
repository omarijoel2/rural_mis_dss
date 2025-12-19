<?php

namespace App\Http\Controllers\Api\V1\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Procurement\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    /**
     * GET /api/v1/procurement/vendors
     */
    public function index(Request $request)
    {
        $query = Vendor::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $vendors = $query->orderBy('name')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $vendors->items(),
            'meta' => [
                'total' => $vendors->total(),
                'per_page' => $vendors->perPage(),
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/procurement/vendors
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'category' => 'required|in:goods,services,works,consultancy',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['vendor_code'] = 'VEN-' . now()->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $vendor = Vendor::create($validated);

        return response()->json([
            'data' => $vendor,
            'message' => 'Vendor registered successfully.',
        ], 201);
    }

    /**
     * GET /api/v1/procurement/vendors/{id}
     */
    public function show($id)
    {
        $vendor = Vendor::withCount(['bids'])->findOrFail($id);
        return response()->json(['data' => $vendor]);
    }

    /**
     * PATCH /api/v1/procurement/vendors/{id}
     */
    public function update(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'in:active,suspended,blacklisted',
        ]);

        $vendor->update($validated);

        return response()->json([
            'data' => $vendor,
            'message' => 'Vendor updated successfully.',
        ]);
    }
}
