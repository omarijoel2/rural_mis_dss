<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LookupValue;
use Illuminate\Http\Request;

class LookupController extends Controller
{
    /**
     * Return lookup values filtered by domain.
     * GET /api/v1/lookup-values?domain=county
     */
    public function index(Request $request)
    {
        $domain = $request->query('domain');

        $query = LookupValue::query();

        if ($domain) {
            $query->where('domain', $domain);
        }

        $query->where('active', true);

        $values = $query->orderBy('order')->get();

        return response()->json(["data" => $values]);
    }
}
