<?php

namespace App\Http\Controllers\API\V1\Cmms;

use App\Http\Controllers\Controller;
use App\Services\Cmms\StoresService;
use Illuminate\Http\Request;

class StoresController extends Controller
{
    public function __construct(protected StoresService $storesService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['scheme_id', 'type']);
        $stores = $this->storesService->getAllStores($filters);
        return response()->json($stores);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:central,regional,mobile,quarantine',
            'location' => 'nullable|string',
            'manager_id' => 'nullable|uuid|exists:users,id'
        ]);

        $store = $this->storesService->createStore($validated);
        return response()->json($store, 201);
    }

    public function show(int $id)
    {
        $store = $this->storesService->getStore($id);
        return response()->json($store);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'in:central,regional,mobile,quarantine',
            'location' => 'nullable|string',
            'manager_id' => 'nullable|uuid|exists:users,id'
        ]);

        $store = $this->storesService->updateStore($id, $validated);
        return response()->json($store);
    }

    public function createBin(Request $request, int $storeId)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'location' => 'nullable|string|max:255',
            'type' => 'required|in:shelf,bin,cage,yard',
            'is_active' => 'boolean'
        ]);

        $bin = $this->storesService->createBin($storeId, $validated);
        return response()->json($bin, 201);
    }

    public function receiveStock(Request $request)
    {
        $validated = $request->validate([
            'part_id' => 'required|integer|exists:parts,id',
            'bin_id' => 'required|integer|exists:bins,id',
            'qty' => 'required|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'po_ref' => 'nullable|string'
        ]);

        $txn = $this->storesService->receiveStock(
            $validated['part_id'],
            $validated['bin_id'],
            $validated['qty'],
            $validated['unit_cost'],
            $validated['po_ref'] ?? null
        );

        return response()->json($txn, 201);
    }

    public function issueStock(Request $request)
    {
        $validated = $request->validate([
            'part_id' => 'required|integer|exists:parts,id',
            'bin_id' => 'required|integer|exists:bins,id',
            'qty' => 'required|numeric|min:0',
            'work_order_id' => 'required|integer|exists:work_orders,id'
        ]);

        $txn = $this->storesService->issueStock(
            $validated['part_id'],
            $validated['bin_id'],
            $validated['qty'],
            $validated['work_order_id']
        );

        return response()->json($txn, 201);
    }

    public function valuation()
    {
        $valuation = $this->storesService->getStockValuation();
        return response()->json($valuation);
    }

    public function lowStock()
    {
        $alerts = $this->storesService->getLowStockAlerts();
        return response()->json($alerts);
    }
}
