<?php

namespace App\Http\Controllers\DSA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TariffController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('tariff_scenarios')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc');

        $scenarios = $query->get()->map(function ($scenario) {
            $scenario->tariff_structure = json_decode($scenario->tariff_structure, true);
            $scenario->results = json_decode($scenario->results, true);
            return $scenario;
        });

        return response()->json([
            'data' => $scenarios,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scheme_id' => 'string|nullable',
            'lifeline_enabled' => 'boolean',
            'fixed_charge' => 'numeric|min:0',
            'blocks' => 'required|array',
            'blocks.*.min' => 'required|numeric|min:0',
            'blocks.*.max' => 'required|numeric',
            'blocks.*.rate' => 'required|numeric|min:0',
            'elasticity' => 'numeric|min:0|max:1',
        ]);

        $scenarioId = Str::uuid();

        DB::table('tariff_scenarios')->insert([
            'id' => $scenarioId,
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'scheme_id' => $validated['scheme_id'] ?? null,
            'status' => 'draft',
            'tariff_structure' => json_encode([
                'lifeline_enabled' => $validated['lifeline_enabled'] ?? false,
                'fixed_charge' => $validated['fixed_charge'],
                'blocks' => $validated['blocks'],
                'elasticity' => $validated['elasticity'] ?? 0.15,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // TODO: Dispatch tariff simulation job to queue (Phase 2)
        // DispatchTariffSimulation::dispatch($scenarioId);

        DB::table('tariff_scenarios')
            ->where('id', $scenarioId)
            ->update(['status' => 'simulated']);

        return response()->json([
            'id' => $scenarioId,
            'message' => 'Tariff scenario created successfully',
        ], 201);
    }
}
