<?php

namespace App\Http\Controllers\DSA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HydroController extends Controller
{
    public function aquifers(Request $request)
    {
        $query = DB::table('hydro_kpis')
            ->where('tenant_id', $request->user()->tenant_id);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->query('scheme_id'));
        }

        $kpis = $query->orderBy('as_of', 'desc')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $kpis,
        ]);
    }

    public function wellfield(Request $request)
    {
        $schemeId = $request->query('scheme_id');
        $aquifer = $request->query('aquifer');

        if (!$schemeId) {
            return response()->json(['message' => 'scheme_id parameter required'], 400);
        }

        // TODO: Fetch wellfield GeoJSON data from water_sources or dedicated wellfield table (Phase 2)
        // For now, return placeholder structure
        $wellfieldData = [
            'type' => 'FeatureCollection',
            'features' => [],
        ];

        return response()->json([
            'data' => $wellfieldData,
        ]);
    }
}
