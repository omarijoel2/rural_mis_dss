<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PumpSchedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = PumpSchedule::query()->with(['asset', 'scheme']);

        if ($request->has('asset_id')) {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('from')) {
            $query->where('start_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('end_at', '<=', $request->to);
        }

        $schedules = $query->latest('start_at')->paginate($request->get('per_page', 30));
        return response()->json($schedules);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|uuid|exists:assets,id',
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'target_volume_m3' => 'nullable|numeric',
            'constraints' => 'nullable|array',
            'source' => 'nullable|in:manual,optimizer',
        ]);

        $validated['tenant_id'] = auth()->user()->currentTenantId();
        $validated['status'] = 'scheduled';

        $schedule = PumpSchedule::create($validated);
        return response()->json($schedule, 201);
    }

    public function update(Request $request, PumpSchedule $schedule)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:scheduled,running,completed,cancelled',
            'actual_volume_m3' => 'nullable|numeric',
            'energy_cost' => 'nullable|numeric',
        ]);

        $schedule->update($validated);
        return response()->json($schedule);
    }
}
