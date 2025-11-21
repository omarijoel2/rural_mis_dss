<?php

namespace App\Http\Controllers\DSA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EWSController extends Controller
{
    public function getRules(Request $request)
    {
        $query = DB::table('ews_rules')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc');

        $rules = $query->get()->map(function ($rule) {
            $rule->conditions = json_decode($rule->conditions, true);
            $rule->actions = json_decode($rule->actions, true);
            return $rule;
        });

        return response()->json([
            'data' => $rules,
        ]);
    }

    public function createRule(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'string|nullable',
            'priority' => 'required|in:critical,high,medium,low',
            'enabled' => 'boolean',
            'signals' => 'required|array',
            'signals.*.tag' => 'required|string',
            'signals.*.operator' => 'required|in:>,<,>=,<=,=',
            'signals.*.threshold' => 'required|numeric',
            'channels' => 'array',
            'quiet_hours_start' => 'integer|min:0|max:23|nullable',
            'quiet_hours_end' => 'integer|min:0|max:23|nullable',
        ]);

        $ruleId = Str::uuid();

        DB::table('ews_rules')->insert([
            'id' => $ruleId,
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'priority' => $validated['priority'],
            'enabled' => $validated['enabled'] ?? true,
            'conditions' => json_encode($validated['signals']),
            'actions' => json_encode([
                'channels' => $validated['channels'] ?? ['email'],
            ]),
            'quiet_hours_start' => $validated['quiet_hours_start'] ?? null,
            'quiet_hours_end' => $validated['quiet_hours_end'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'id' => $ruleId,
            'message' => 'EWS rule created successfully',
        ], 201);
    }

    public function getAlerts(Request $request)
    {
        $query = DB::table('alerts')
            ->where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->limit(500);

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $alerts = $query->get()->map(function ($alert) {
            $alert->trigger_values = json_decode($alert->trigger_values, true);
            return $alert;
        });

        return response()->json([
            'data' => $alerts,
        ]);
    }

    public function acknowledgeAlert(Request $request, string $id)
    {
        $alert = DB::table('alerts')
            ->where('id', $id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->first();

        if (!$alert) {
            return response()->json(['message' => 'Alert not found'], 404);
        }

        $responseTime = now()->diffInMinutes($alert->created_at);

        DB::table('alerts')
            ->where('id', $id)
            ->update([
                'status' => 'acknowledged',
                'acknowledged_by' => $request->user()->id,
                'acknowledged_at' => now(),
                'response_time_minutes' => $responseTime,
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Alert acknowledged successfully',
        ]);
    }
}
