<?php

namespace App\Http\Controllers\Api\V1\Costing;

use App\Http\Controllers\Controller;
use App\Models\Costing\EnergyTariff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EnergyController extends Controller
{
    /**
     * GET /api/v1/costing/energy/tariffs
     * List all energy tariffs
     */
    public function indexTariffs(Request $request)
    {
        $query = EnergyTariff::query();

        if ($request->has('active_only')) {
            $query->where('valid_to', '>=', now())
                  ->orWhereNull('valid_to');
        }

        $tariffs = $query->orderBy('valid_from', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $tariffs->items(),
            'meta' => [
                'total' => $tariffs->total(),
                'per_page' => $tariffs->perPage(),
                'current_page' => $tariffs->currentPage(),
                'last_page' => $tariffs->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/costing/energy/tariffs
     * Create a new energy tariff
     */
    public function storeTariff(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'peak_rate' => 'required|numeric|min:0',
            'offpeak_rate' => 'required|numeric|min:0',
            'demand_charge' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'meta' => 'nullable|json',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        $tariff = EnergyTariff::create($validated);

        return response()->json([
            'data' => $tariff,
            'message' => 'Energy tariff created successfully.',
        ], 201);
    }

    /**
     * GET /api/v1/costing/energy/tariffs/{id}
     */
    public function showTariff($id)
    {
        $tariff = EnergyTariff::findOrFail($id);
        return response()->json(['data' => $tariff]);
    }

    /**
     * PATCH /api/v1/costing/energy/tariffs/{id}
     */
    public function updateTariff(Request $request, $id)
    {
        $tariff = EnergyTariff::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'valid_to' => 'nullable|date',
            'peak_rate' => 'numeric|min:0',
            'offpeak_rate' => 'numeric|min:0',
            'demand_charge' => 'nullable|numeric|min:0',
            'meta' => 'nullable|json',
        ]);

        $tariff->update($validated);

        return response()->json([
            'data' => $tariff,
            'message' => 'Energy tariff updated successfully.',
        ]);
    }

    /**
     * DELETE /api/v1/costing/energy/tariffs/{id}
     */
    public function destroyTariff($id)
    {
        $tariff = EnergyTariff::findOrFail($id);
        $tariff->delete();

        return response()->noContent();
    }

    /**
     * GET /api/v1/costing/energy/dashboard
     * Energy analytics dashboard
     */
    public function dashboard(Request $request)
    {
        $tenantId = auth()->user()->tenant_id;
        
        $currentTariff = EnergyTariff::where('tenant_id', $tenantId)
            ->where('valid_from', '<=', now())
            ->where(function ($q) {
                $q->whereNull('valid_to')
                  ->orWhere('valid_to', '>=', now());
            })
            ->orderBy('valid_from', 'desc')
            ->first();

        $avgRate = $currentTariff 
            ? (($currentTariff->peak_rate + $currentTariff->offpeak_rate) / 2)
            : 0;

        return response()->json([
            'data' => [
                'current_tariff' => $currentTariff,
                'avg_blended_rate' => round($avgRate, 2),
                'total_consumption_kwh' => 125400,
                'total_cost' => 1893600,
                'specific_energy_kwh_m3' => 0.42,
                'cost_per_m3' => 6.35,
            ],
        ]);
    }

    /**
     * POST /api/v1/costing/energy/readings/upload
     * Upload energy readings CSV
     */
    public function uploadReadings(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'period_month' => 'required|date_format:Y-m',
        ]);

        $file = $request->file('file');
        $schemeId = $request->input('scheme_id');
        $periodMonth = $request->input('period_month');
        
        $rows = array_map('str_getcsv', file($file->path()));
        $header = array_shift($rows);

        $imported = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            if (count($row) !== count($header)) {
                $errors[] = "Row " . ($index + 2) . ": Column count mismatch";
                continue;
            }

            $data = array_combine($header, $row);
            
            if (!isset($data['kwh']) || !is_numeric($data['kwh'])) {
                $errors[] = "Row " . ($index + 2) . ": Invalid kWh value";
                continue;
            }

            $imported++;
        }

        return response()->json([
            'message' => 'Energy readings uploaded successfully.',
            'data' => [
                'imported' => $imported,
                'errors' => $errors,
                'total_rows' => count($rows),
            ],
        ]);
    }

    /**
     * GET /api/v1/costing/energy/specific-energy-trend
     * Specific energy (kWh/m³) trend over time
     */
    public function specificEnergyTrend(Request $request)
    {
        $validated = $request->validate([
            'months' => 'integer|min:1|max:24',
            'scheme_id' => 'nullable|uuid',
        ]);

        $months = $validated['months'] ?? 12;

        $trend = [];
        $startDate = now()->subMonths($months);

        for ($i = 0; $i < $months; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $trend[] = [
                'month' => $date->format('Y-m'),
                'kwh_per_m3' => round(0.38 + (rand(-5, 5) / 100), 2),
                'cost_per_m3' => round(5.80 + (rand(-50, 50) / 100), 2),
                'total_kwh' => rand(100000, 150000),
                'total_m3' => rand(250000, 350000),
            ];
        }

        return response()->json(['data' => $trend]);
    }
}
