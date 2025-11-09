<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\PremiseService;
use Illuminate\Http\Request;

class PremiseController extends Controller
{
    public function __construct(private PremiseService $premiseService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['scheme_id', 'dma_id', 'category', 'search']);
        $premises = $this->premiseService->searchPremises($filters, auth()->user());
        return response()->json($premises);
    }

    public function store(Request $request)
    {
        $premise = $this->premiseService->createPremise($request->all(), auth()->user());
        return response()->json($premise, 201);
    }

    public function show(int $id)
    {
        $premise = $this->premiseService->getPremise($id, auth()->user());
        return response()->json($premise);
    }

    public function update(Request $request, int $id)
    {
        $premise = $this->premiseService->updatePremise($id, $request->all(), auth()->user());
        return response()->json($premise);
    }

    public function nearby(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'required|integer|min:1|max:5000',
        ]);

        $premises = $this->premiseService->getPremisesNearPoint(
            $request->lat,
            $request->lng,
            $request->radius,
            auth()->user()
        );

        return response()->json($premises);
    }
}
