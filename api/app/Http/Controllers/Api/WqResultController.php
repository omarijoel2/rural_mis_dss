<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WaterQuality\ResultsService;
use App\Services\WaterQuality\QcService;
use Illuminate\Http\Request;

class WqResultController extends Controller
{
    public function __construct(
        protected ResultsService $resultsService,
        protected QcService $qcService
    ) {
    }

    public function index(Request $request)
    {
        $this->authorize('view water quality results');

        $filters = $request->only(['parameter_id', 'sample_id', 'from_date', 'to_date']);
        $results = $this->resultsService->listResults($request->user(), $filters, $request->get('per_page', 15));

        return response()->json($results);
    }

    public function store(Request $request)
    {
        $this->authorize('create water quality results');

        $result = $this->resultsService->createResult($request->all(), $request->user());

        // Auto-flag the result
        $flags = $this->qcService->autoFlagResult($result);

        $result->qc_flags_applied = $flags;

        return response()->json($result, 201);
    }

    public function importCsv(Request $request)
    {
        $this->authorize('import water quality results');

        $request->validate([
            'csv_content' => 'required|string',
        ]);

        $imported = $this->resultsService->importFromCsv($request->csv_content, $request->user());

        return response()->json([
            'message' => 'Results imported successfully',
            'count' => count($imported),
        ]);
    }
}
