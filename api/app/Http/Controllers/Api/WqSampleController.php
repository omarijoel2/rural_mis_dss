<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WaterQuality\SamplingService;
use Illuminate\Http\Request;

class WqSampleController extends Controller
{
    public function __construct(protected SamplingService $samplingService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('view water quality samples');

        $filters = $request->only(['custody_state', 'plan_id', 'barcode']);
        $samples = $this->samplingService->listSamples($request->user(), $filters, $request->get('per_page', 15));

        return response()->json($samples);
    }

    public function store(Request $request)
    {
        $this->authorize('create water quality samples');

        $sample = $this->samplingService->createAdHocSample($request->all(), $request->user());

        return response()->json($sample, 201);
    }

    public function show(int $sampleId, Request $request)
    {
        $this->authorize('view water quality samples');

        $sample = \App\Models\WqSample::whereHas('samplingPoint', function ($q) use ($request) {
                $q->where('tenant_id', $request->user()->currentTenantId());
            })
            ->with(['samplingPoint', 'plan', 'sampleParams.parameter', 'collectedBy'])
            ->findOrFail($sampleId);

        return response()->json($sample);
    }

    public function collect(int $sampleId, Request $request)
    {
        $this->authorize('edit water quality samples');

        $sample = $this->samplingService->collectSample($sampleId, $request->all(), $request->user());

        return response()->json($sample);
    }

    public function receiveLab(int $sampleId, Request $request)
    {
        $this->authorize('edit water quality samples');

        $sample = $this->samplingService->receiveSampleInLab($sampleId, $request->all(), $request->user());

        return response()->json($sample);
    }

    public function byBarcode(string $barcode, Request $request)
    {
        $this->authorize('view water quality samples');

        $sample = $this->samplingService->getSampleByBarcode($barcode, $request->user());

        return response()->json($sample);
    }
}
