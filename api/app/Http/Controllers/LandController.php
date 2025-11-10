<?php

namespace App\Http\Controllers;

use App\Http\Requests\Projects\StoreLandParcelRequest;
use App\Http\Requests\Projects\UpdateLandParcelRequest;
use App\Http\Requests\Projects\StoreWayleaveRequest;
use App\Http\Requests\Projects\UpdateWayleaveRequest;
use App\Http\Requests\Projects\StoreCompensationRequest;
use App\Http\Requests\Projects\UpdateCompensationRequest;
use App\Http\Requests\Projects\UpdatePaymentRequest;
use App\Http\Requests\Projects\StoreDisputeRequest;
use App\Http\Requests\Projects\UpdateDisputeRequest;
use App\Services\Projects\LandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandController extends Controller
{
    public function __construct(private LandService $landService)
    {
    }

    /**
     * List all land parcels
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'category_id', 'project_id', 'search']);
        $parcels = $this->landService->getAllParcels($filters);

        return response()->json($parcels);
    }

    /**
     * Get a single parcel with details
     */
    public function show(string $id): JsonResponse
    {
        $parcel = $this->landService->getParcelDetails($id);

        return response()->json($parcel);
    }

    /**
     * Create a new land parcel
     */
    public function store(StoreLandParcelRequest $request): JsonResponse
    {
        $data = $request->validated();
        $parcel = $this->landService->createParcel($data);

        return response()->json($parcel, 201);
    }

    /**
     * Update a land parcel
     */
    public function update(UpdateLandParcelRequest $request, string $id): JsonResponse
    {
        $data = $request->validated();
        $parcel = $this->landService->updateParcel($id, $data);

        return response()->json($parcel);
    }

    /**
     * Delete a land parcel
     */
    public function destroy(string $id): JsonResponse
    {
        $this->landService->deleteParcel($id);

        return response()->json(null, 204);
    }

    /**
     * Get parcels within a bounding box
     */
    public function inBounds(Request $request): JsonResponse
    {
        $request->validate([
            'min_lat' => 'required|numeric|min:-90|max:90',
            'max_lat' => 'required|numeric|min:-90|max:90',
            'min_lng' => 'required|numeric|min:-180|max:180',
            'max_lng' => 'required|numeric|min:-180|max:180',
        ]);

        $parcels = $this->landService->getParcelsInBounds($request->all());

        return response()->json($parcels);
    }

    /**
     * Create a wayleave for a parcel
     */
    public function storeWayleave(StoreWayleaveRequest $request, string $parcelId): JsonResponse
    {
        $data = $request->validated();
        $wayleave = $this->landService->createWayleave($parcelId, $data);

        return response()->json($wayleave, 201);
    }

    /**
     * Update a wayleave
     */
    public function updateWayleave(UpdateWayleaveRequest $request, string $parcelId, string $id): JsonResponse
    {
        $data = $request->validated();
        $wayleave = $this->landService->updateWayleave($id, $data);

        return response()->json($wayleave);
    }

    /**
     * Delete a wayleave
     */
    public function destroyWayleave(string $parcelId, string $id): JsonResponse
    {
        $this->landService->deleteWayleave($id);

        return response()->json(null, 204);
    }

    /**
     * Create a compensation record for a parcel
     */
    public function storeCompensation(StoreCompensationRequest $request, string $parcelId): JsonResponse
    {
        $data = $request->validated();
        $compensation = $this->landService->createCompensation($parcelId, $data);

        return response()->json($compensation, 201);
    }

    /**
     * Update a compensation record
     */
    public function updateCompensation(UpdateCompensationRequest $request, string $parcelId, string $id): JsonResponse
    {
        $data = $request->validated();
        $compensation = $this->landService->updateCompensation($id, $data);

        return response()->json($compensation);
    }

    /**
     * Update payment information for a compensation
     */
    public function updatePayment(UpdatePaymentRequest $request, string $parcelId, string $id): JsonResponse
    {
        $data = $request->validated();
        $compensation = $this->landService->updatePayment($id, $data);

        return response()->json($compensation);
    }

    /**
     * Delete a compensation record
     */
    public function destroyCompensation(string $parcelId, string $id): JsonResponse
    {
        $this->landService->deleteCompensation($id);

        return response()->json(null, 204);
    }

    /**
     * Create a dispute for a parcel
     */
    public function storeDispute(StoreDisputeRequest $request, string $parcelId): JsonResponse
    {
        $data = $request->validated();
        $dispute = $this->landService->createDispute($parcelId, $data);

        return response()->json($dispute, 201);
    }

    /**
     * Update a dispute
     */
    public function updateDispute(UpdateDisputeRequest $request, string $parcelId, string $id): JsonResponse
    {
        $data = $request->validated();
        $dispute = $this->landService->updateDispute($id, $data);

        return response()->json($dispute);
    }

    /**
     * Delete a dispute
     */
    public function destroyDispute(string $parcelId, string $id): JsonResponse
    {
        $this->landService->deleteDispute($id);

        return response()->json(null, 204);
    }

    /**
     * Get land administration dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        $stats = $this->landService->getDashboardStats();

        return response()->json($stats);
    }
}
