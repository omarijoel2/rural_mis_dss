<?php

namespace App\Http\Controllers\DSA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ScenarioController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('scenarios')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc');

        $scenarios = $query->get()->map(function ($scenario) {
            $scenario->params = json_decode($scenario->params, true);
            $scenario->playbook = json_decode($scenario->playbook, true);
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
            'type' => 'required|in:drought,demand_spike,contamination,power_shock,asset_failure,custom',
            'scheme_id' => 'required|string',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'severity' => 'required|numeric|min:0|max:100',
            'monte_carlo_runs' => 'integer|min:10|max:10000',
            'playbook' => 'array',
            'params' => 'array',
        ]);

        $scenarioId = Str::uuid();

        DB::table('scenarios')->insert([
            'id' => $scenarioId,
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'scheme_id' => $validated['scheme_id'],
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'status' => 'draft',
            'params' => json_encode(array_merge([
                'severity' => $validated['severity'],
                'monte_carlo_runs' => $validated['monte_carlo_runs'] ?? 100,
            ], $validated['params'] ?? [])),
            'playbook' => json_encode($validated['playbook'] ?? []),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'id' => $scenarioId,
            'message' => 'Scenario created successfully',
        ], 201);
    }

    public function run(Request $request, string $id)
    {
        $scenario = DB::table('scenarios')
            ->where('id', $id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->first();

        if (!$scenario) {
            return response()->json(['message' => 'Scenario not found'], 404);
        }

        DB::table('scenarios')
            ->where('id', $id)
            ->update([
                'status' => 'running',
                'updated_at' => now(),
            ]);

        // TODO: Dispatch scenario simulation job to queue (Phase 2)
        // DispatchScenarioSimulation::dispatch($id);

        return response()->json([
            'message' => 'Scenario simulation started',
        ]);
    }
}
