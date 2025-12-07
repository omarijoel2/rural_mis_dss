<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\CustomerTariff;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TariffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CustomerTariff::query();

        if ($request->user()?->current_tenant_id) {
            $query->where('tenant_id', $request->user()->current_tenant_id);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('active')) {
            $query->where('effective_date', '<=', now())
                  ->where(function($q) {
                      $q->whereNull('end_date')
                        ->orWhere('end_date', '>=', now());
                  });
        }

        $tariffs = $query->orderBy('effective_date', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'data' => $tariffs->items(),
            'meta' => [
                'current_page' => $tariffs->currentPage(),
                'last_page' => $tariffs->lastPage(),
                'per_page' => $tariffs->perPage(),
                'total' => $tariffs->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tariff_code' => 'required|string|unique:customer_tariffs,tariff_code',
            'name' => 'required|string|max:255',
            'category' => 'required|in:domestic,commercial,industrial,institutional,kiosk',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'rate_blocks' => 'required|array',
            'fixed_charge' => 'nullable|numeric|min:0',
            'vat_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $validated['tenant_id'] = $request->user()->current_tenant_id;

        $tariff = CustomerTariff::create($validated);

        return response()->json(['data' => $tariff], 201);
    }

    public function show(CustomerTariff $tariff): JsonResponse
    {
        return response()->json(['data' => $tariff]);
    }

    public function update(Request $request, CustomerTariff $tariff): JsonResponse
    {
        $validated = $request->validate([
            'tariff_code' => 'sometimes|string|unique:customer_tariffs,tariff_code,' . $tariff->id,
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:domestic,commercial,industrial,institutional,kiosk',
            'effective_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:effective_date',
            'rate_blocks' => 'sometimes|array',
            'fixed_charge' => 'nullable|numeric|min:0',
            'vat_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $tariff->update($validated);

        return response()->json(['data' => $tariff]);
    }

    public function destroy(CustomerTariff $tariff): JsonResponse
    {
        $tariff->delete();
        return response()->json(null, 204);
    }
}
