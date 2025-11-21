<?php

namespace App\Http\Controllers\DSA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AnomalyController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('anomalies')
            ->where('tenant_id', $request->user()->tenant_id);

        if ($request->has('signal')) {
            $query->where('signal', $request->query('signal'));
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->query('scheme_id'));
        }

        if ($request->has('score_min')) {
            $query->where('score', '>=', $request->query('score_min'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $anomalies = $query->orderBy('ts', 'desc')
            ->limit(500)
            ->get()
            ->map(function ($anomaly) {
                $anomaly->trigger_values = json_decode($anomaly->trigger_values, true);
                $anomaly->triage = json_decode($anomaly->triage, true);
                return $anomaly;
            });

        return response()->json([
            'data' => $anomalies,
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'string',
            'status' => 'required|in:acknowledged,investigating,resolved,false_positive',
        ]);

        $updated = DB::table('anomalies')
            ->where('tenant_id', $request->user()->tenant_id)
            ->whereIn('id', $validated['ids'])
            ->update([
                'status' => $validated['status'],
                'acknowledged_by' => $request->user()->id,
                'acknowledged_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => "$updated anomalies updated successfully",
        ]);
    }

    public function createWorkOrder(Request $request, string $id)
    {
        $anomaly = DB::table('anomalies')
            ->where('id', $id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->first();

        if (!$anomaly) {
            return response()->json(['message' => 'Anomaly not found'], 404);
        }

        // TODO: Create work order in CMMS module (Phase 2)
        // CreateWorkOrderFromAnomaly::dispatch($id);

        DB::table('anomalies')
            ->where('id', $id)
            ->update([
                'status' => 'investigating',
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' => 'Work order created successfully',
        ]);
    }
}
