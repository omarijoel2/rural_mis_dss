<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmTariff;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TariffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $query = CrmTariff::query();
        
        if ($request->has('status')) {
            $now = now();
            if ($request->input('status') === 'active') {
                $query->where('valid_from', '<=', $now)
                    ->where(function($q) use ($now) {
                        $q->whereNull('valid_to')
                          ->orWhere('valid_to', '>=', $now);
                    });
            } elseif ($request->input('status') === 'expired') {
                $query->where('valid_to', '<', $now);
            } elseif ($request->input('status') === 'future') {
                $query->where('valid_from', '>', $now);
            }
        }
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'ilike', "%{$search}%");
        }
        
        $query->orderBy('valid_from', 'desc');
        
        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'blocks' => 'required|array',
            'blocks.*.min' => 'required|numeric|min:0',
            'blocks.*.max' => 'nullable|numeric|gt:blocks.*.min',
            'blocks.*.rate' => 'required|numeric|min:0',
            'blocks.*.lifeline' => 'boolean',
            'fixed_charge' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
        ]);

        $validated['tenant_id'] = auth()->user()->currentTenantId();

        $tariff = CrmTariff::create($validated);

        return response()->json($tariff, 201);
    }

    public function show(int $id): JsonResponse
    {
        $tariff = CrmTariff::findOrFail($id);
        return response()->json($tariff);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tariff = CrmTariff::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'valid_from' => 'sometimes|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'blocks' => 'sometimes|array',
            'blocks.*.min' => 'required_with:blocks|numeric|min:0',
            'blocks.*.max' => 'nullable|numeric',
            'blocks.*.rate' => 'required_with:blocks|numeric|min:0',
            'blocks.*.lifeline' => 'boolean',
            'fixed_charge' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
        ]);

        $tariff->update($validated);

        return response()->json($tariff);
    }

    public function destroy(int $id): JsonResponse
    {
        $tariff = CrmTariff::findOrFail($id);
        
        // Check if tariff is in use
        $connectionsCount = \App\Models\CrmServiceConnection::where('tariff_id', $id)->count();
        if ($connectionsCount > 0) {
            return response()->json([
                'message' => "Cannot delete tariff. It is currently used by {$connectionsCount} service connection(s)."
            ], 422);
        }
        
        $tariff->delete();

        return response()->json(['message' => 'Tariff deleted successfully']);
    }

    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tariff_id' => 'required|exists:crm_tariffs,id',
            'consumption' => 'required|numeric|min:0',
        ]);

        $tariff = CrmTariff::findOrFail($validated['tariff_id']);
        $consumption = $validated['consumption'];

        $totalCharge = $tariff->fixed_charge ?? 0;
        $blocks = $tariff->blocks;

        $remainingConsumption = $consumption;
        $breakdown = [];

        foreach ($blocks as $block) {
            if ($remainingConsumption <= 0) break;

            $blockMin = $block['min'];
            $blockMax = $block['max'] ?? PHP_FLOAT_MAX;
            $blockRate = $block['rate'];
            $isLifeline = $block['lifeline'] ?? false;

            $blockSize = $blockMax - $blockMin;
            $consumedInBlock = min($remainingConsumption, $blockSize);

            $blockCharge = $consumedInBlock * $blockRate;
            $totalCharge += $blockCharge;

            $breakdown[] = [
                'block' => "{$blockMin}-" . ($blockMax === PHP_FLOAT_MAX ? '∞' : $blockMax) . " m³",
                'consumption' => $consumedInBlock,
                'rate' => $blockRate,
                'charge' => $blockCharge,
                'lifeline' => $isLifeline,
            ];

            $remainingConsumption -= $consumedInBlock;
        }

        return response()->json([
            'tariff' => $tariff->name,
            'consumption' => $consumption,
            'fixed_charge' => $tariff->fixed_charge ?? 0,
            'variable_charge' => $totalCharge - ($tariff->fixed_charge ?? 0),
            'total_charge' => $totalCharge,
            'currency' => $tariff->currency,
            'breakdown' => $breakdown,
        ]);
    }
}
