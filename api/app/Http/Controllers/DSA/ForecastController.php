<?php

namespace App\Http\Controllers\DSA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ForecastController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('forecast_jobs')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc');

        $jobs = $query->get()->map(function ($job) {
            $job->params = json_decode($job->params, true);
            $job->scores = json_decode($job->scores, true);
            return $job;
        });

        return response()->json([
            'data' => $jobs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'entity_type' => 'required|string',
            'entity_id' => 'required|string',
            'metric' => 'required|string',
            'horizon_days' => 'required|integer|min:1|max:365',
            'model_family' => 'required|in:auto,arima,ets,prophet,lstm',
            'seasonality' => 'boolean',
            'holdout_pct' => 'integer|min:0|max:50',
            'exogenous_drivers' => 'array',
        ]);

        $jobId = Str::uuid();

        DB::table('forecast_jobs')->insert([
            'id' => $jobId,
            'tenant_id' => $request->user()->tenant_id,
            'metric' => $validated['metric'],
            'entity_type' => $validated['entity_type'],
            'entity_id' => $validated['entity_id'],
            'horizon_days' => $validated['horizon_days'],
            'model_family' => $validated['model_family'],
            'status' => 'pending',
            'params' => json_encode([
                'seasonality' => $validated['seasonality'] ?? true,
                'holdout_pct' => $validated['holdout_pct'] ?? 20,
                'exogenous_drivers' => $validated['exogenous_drivers'] ?? [],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // TODO: Dispatch forecast job to queue (Phase 2)
        // DispatchForecastJob::dispatch($jobId);

        return response()->json([
            'id' => $jobId,
            'message' => 'Forecast job created successfully',
        ], 201);
    }

    public function show(Request $request, string $id)
    {
        $job = DB::table('forecast_jobs')
            ->where('id', $id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->first();

        if (!$job) {
            return response()->json(['message' => 'Forecast job not found'], 404);
        }

        $job->params = json_decode($job->params, true);
        $job->scores = json_decode($job->scores, true);
        $job->outputs = json_decode($job->outputs, true);

        // For completed jobs, return full forecast results
        if ($job->status === 'completed' && $job->outputs) {
            return response()->json([
                'historical' => $job->outputs['historical'] ?? [],
                'forecast' => $job->outputs['forecast'] ?? [],
                'model_card' => $job->outputs['model_card'] ?? [],
            ]);
        }

        return response()->json($job);
    }
}
