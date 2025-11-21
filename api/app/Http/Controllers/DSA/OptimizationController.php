<?php

namespace App\Http\Controllers\DSA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OptimizationController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        
        $query = DB::table('optim_runs')
            ->where('tenant_id', $request->user()->tenant_id);

        if ($type) {
            $query->where('optim_type', $type);
        }

        $runs = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($run) {
                $run->inputs = json_decode($run->inputs, true);
                $run->kpis = json_decode($run->kpis, true);
                $run->outputs = json_decode($run->outputs, true);
                return $run;
            });

        return response()->json([
            'data' => $runs,
        ]);
    }

    public function optimize(Request $request, string $type)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|string',
            'asset_ids' => 'array',
            'target_volume_m3' => 'numeric|min:0',
            'objective' => 'required|in:minimize_energy_cost,minimize_peak_demand,maximize_storage',
        ]);

        $runId = Str::uuid();

        DB::table('optim_runs')->insert([
            'id' => $runId,
            'tenant_id' => $request->user()->tenant_id,
            'optim_type' => $type,
            'status' => 'pending',
            'inputs' => json_encode([
                'scheme_id' => $validated['scheme_id'],
                'asset_ids' => $validated['asset_ids'] ?? [],
                'target_volume_m3' => $validated['target_volume_m3'] ?? null,
                'objective' => $validated['objective'],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // TODO: Dispatch optimization job to queue (Phase 2)
        // DispatchOptimizationJob::dispatch($runId, $type);

        return response()->json([
            'id' => $runId,
            'message' => 'Optimization started successfully',
        ], 201);
    }

    public function publish(Request $request, string $id)
    {
        $run = DB::table('optim_runs')
            ->where('id', $id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->first();

        if (!$run) {
            return response()->json(['message' => 'Optimization run not found'], 404);
        }

        if ($run->status !== 'completed') {
            return response()->json(['message' => 'Only completed optimization runs can be published'], 400);
        }

        // TODO: Publish optimized plan to CoreOps (Phase 2)
        // PublishOptimizationPlan::dispatch($id);

        return response()->json([
            'message' => 'Plan published to CoreOps successfully',
        ]);
    }
}
