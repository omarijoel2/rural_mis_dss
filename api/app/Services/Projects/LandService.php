<?php

namespace App\Services\Projects;

use App\Models\Projects\LandParcel;
use App\Models\Projects\Wayleave;
use App\Models\Projects\Compensation;
use App\Models\Projects\LandDispute;
use App\Models\Projects\LandDocument;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LandService
{
    /**
     * Get all land parcels with optional filters
     */
    public function getAllParcels(array $filters = [])
    {
        $query = LandParcel::with(['category', 'project', 'creator']);

        if (!empty($filters['acquisition_status'])) {
            $query->where('acquisition_status', $filters['acquisition_status']);
        }

        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (!empty($filters['county'])) {
            $query->where('county', $filters['county']);
        }

        if (!empty($filters['title_status'])) {
            $query->where('title_status', $filters['title_status']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get parcels within a geographic bounding box
     */
    public function getParcelsInBounds(array $bounds): array
    {
        // $bounds should contain: ['min_lat', 'max_lat', 'min_lng', 'max_lng']
        // Cast geography boundary to geometry to work with ST_MakeEnvelope
        $parcels = LandParcel::query()
            ->whereRaw("ST_Intersects(boundary::geometry, ST_MakeEnvelope(?, ?, ?, ?, 4326))", [
                $bounds['min_lng'],
                $bounds['min_lat'],
                $bounds['max_lng'],
                $bounds['max_lat'],
            ])
            ->with(['category', 'project'])
            ->get();

        return $parcels->toArray();
    }

    /**
     * Get a single parcel with full details
     */
    public function getParcel(string $id, bool $withDetails = true)
    {
        $query = LandParcel::with(['category', 'project', 'creator']);

        if ($withDetails) {
            $query->with(['wayleaves', 'compensations', 'disputes', 'documents']);
        }

        return $query->findOrFail($id);
    }

    /**
     * Create a new land parcel
     */
    public function createParcel(array $data): LandParcel
    {
        DB::beginTransaction();
        try {
            $parcel = LandParcel::create([
                'tenant_id' => auth()->user()->tenant_id,
                'ref_no' => $data['ref_no'],
                'title_number' => $data['title_number'] ?? null,
                'owner_name' => $data['owner_name'],
                'owner_contact' => $data['owner_contact'] ?? null,
                'title_status' => $data['title_status'] ?? 'unknown',
                'boundary' => $data['boundary'], // PostGIS polygon
                'area_ha' => $data['area_ha'],
                'county' => $data['county'] ?? null,
                'sub_county' => $data['sub_county'] ?? null,
                'ward' => $data['ward'] ?? null,
                'category_id' => $data['category_id'] ?? null,
                'project_id' => $data['project_id'] ?? null,
                'acquisition_status' => $data['acquisition_status'] ?? 'identified',
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
                'meta' => $data['meta'] ?? null,
            ]);

            DB::commit();
            Log::info('Land parcel created', ['parcel_id' => $parcel->id]);

            return $parcel->load(['category', 'project']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create land parcel', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Update an existing land parcel
     */
    public function updateParcel(string $id, array $data): LandParcel
    {
        $parcel = LandParcel::findOrFail($id);

        $parcel->update(array_filter($data, fn($value) => $value !== null));

        Log::info('Land parcel updated', ['parcel_id' => $parcel->id]);

        return $parcel->fresh(['category', 'project']);
    }

    /**
     * Delete a land parcel
     */
    public function deleteParcel(string $id): void
    {
        $parcel = LandParcel::findOrFail($id);

        // Only allow deletion if not acquired
        if ($parcel->acquisition_status === 'acquired') {
            throw new \Exception('Cannot delete an acquired parcel.');
        }

        $parcel->delete();
        Log::info('Land parcel deleted', ['parcel_id' => $id]);
    }

    /**
     * Create a wayleave for a parcel
     */
    public function createWayleave(string $parcelId, array $data): Wayleave
    {
        $parcel = LandParcel::findOrFail($parcelId);

        $wayleave = Wayleave::create([
            'tenant_id' => auth()->user()->tenant_id,
            'parcel_id' => $parcel->id,
            'wayleave_no' => $data['wayleave_no'],
            'type' => $data['type'],
            'width_m' => $data['width_m'] ?? null,
            'length_m' => $data['length_m'] ?? null,
            'agreement_date' => $data['agreement_date'] ?? null,
            'expiry_date' => $data['expiry_date'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'annual_fee' => $data['annual_fee'] ?? null,
            'terms' => $data['terms'] ?? null,
            'documents' => $data['documents'] ?? null,
        ]);

        Log::info('Wayleave created', ['parcel_id' => $parcel->id, 'wayleave_id' => $wayleave->id]);

        return $wayleave;
    }

    /**
     * Update a wayleave
     */
    public function updateWayleave(string $wayleaveId, array $data): Wayleave
    {
        $wayleave = Wayleave::findOrFail($wayleaveId);

        $wayleave->update(array_filter($data, fn($value) => $value !== null));

        return $wayleave->fresh();
    }

    /**
     * Create a compensation record for a parcel
     */
    public function createCompensation(string $parcelId, array $data): Compensation
    {
        $parcel = LandParcel::findOrFail($parcelId);

        $compensation = Compensation::create([
            'tenant_id' => auth()->user()->tenant_id,
            'parcel_id' => $parcel->id,
            'comp_no' => $data['comp_no'],
            'valuation_amount' => $data['valuation_amount'],
            'negotiated_amount' => $data['negotiated_amount'] ?? null,
            'paid_amount' => $data['paid_amount'] ?? 0,
            'comp_type' => $data['comp_type'],
            'valuation_date' => $data['valuation_date'],
            'payment_date' => $data['payment_date'] ?? null,
            'payment_reference' => $data['payment_reference'] ?? null,
            'status' => $data['status'] ?? 'valued',
            'valuation_notes' => $data['valuation_notes'] ?? null,
            'valued_by' => $data['valued_by'] ?? auth()->id(),
        ]);

        Log::info('Compensation created', ['parcel_id' => $parcel->id, 'compensation_id' => $compensation->id]);

        return $compensation;
    }

    /**
     * Approve a compensation payment
     */
    public function approveCompensation(string $compensationId): Compensation
    {
        $compensation = Compensation::findOrFail($compensationId);

        if ($compensation->status === 'paid') {
            throw new \Exception('Compensation already paid.');
        }

        $compensation->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        Log::info('Compensation approved', ['compensation_id' => $compensation->id]);

        return $compensation;
    }

    /**
     * Record a compensation payment
     */
    public function recordPayment(string $compensationId, array $data): Compensation
    {
        $compensation = Compensation::findOrFail($compensationId);

        if ($compensation->status !== 'approved') {
            throw new \Exception('Compensation must be approved before payment can be recorded.');
        }

        $compensation->update([
            'paid_amount' => $data['paid_amount'],
            'payment_date' => $data['payment_date'] ?? now(),
            'payment_reference' => $data['payment_reference'],
            'status' => 'paid',
        ]);

        // Update parcel status if fully compensated
        if ($compensation->parcel->acquisition_status === 'negotiation') {
            $compensation->parcel->update(['acquisition_status' => 'acquired']);
        }

        Log::info('Compensation payment recorded', ['compensation_id' => $compensation->id]);

        return $compensation;
    }

    /**
     * Create a land dispute
     */
    public function createDispute(string $parcelId, array $data): LandDispute
    {
        $parcel = LandParcel::findOrFail($parcelId);

        $dispute = LandDispute::create([
            'tenant_id' => auth()->user()->tenant_id,
            'parcel_id' => $parcel->id,
            'dispute_no' => $data['dispute_no'],
            'description' => $data['description'],
            'type' => $data['type'],
            'raised_date' => $data['raised_date'] ?? now(),
            'status' => $data['status'] ?? 'open',
            'claimant_name' => $data['claimant_name'] ?? null,
            'claimant_contact' => $data['claimant_contact'] ?? null,
            'handled_by' => $data['handled_by'] ?? auth()->id(),
        ]);

        // Update parcel status to disputed
        $parcel->update(['acquisition_status' => 'disputed']);

        Log::info('Land dispute created', ['parcel_id' => $parcel->id, 'dispute_id' => $dispute->id]);

        return $dispute;
    }

    /**
     * Resolve a land dispute
     */
    public function resolveDispute(string $disputeId, array $data): LandDispute
    {
        $dispute = LandDispute::findOrFail($disputeId);

        $dispute->update([
            'resolved_date' => $data['resolved_date'] ?? now(),
            'status' => 'resolved',
            'resolution_notes' => $data['resolution_notes'],
            'settlement_amount' => $data['settlement_amount'] ?? null,
        ]);

        // Check if parcel has any other open disputes
        $openDisputes = $dispute->parcel->disputes()->where('status', '!=', 'resolved')->count();
        if ($openDisputes === 0) {
            // Revert parcel status
            $dispute->parcel->update(['acquisition_status' => 'negotiation']);
        }

        Log::info('Land dispute resolved', ['dispute_id' => $dispute->id]);

        return $dispute;
    }

    /**
     * Upload a document for a parcel
     */
    public function uploadDocument(string $parcelId, array $data): LandDocument
    {
        $parcel = LandParcel::findOrFail($parcelId);

        $document = LandDocument::create([
            'parcel_id' => $parcel->id,
            'doc_type' => $data['doc_type'],
            'file_name' => $data['file_name'],
            'file_path' => $data['file_path'],
            'file_size' => $data['file_size'] ?? null,
            'document_date' => $data['document_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'uploaded_by' => auth()->id(),
        ]);

        Log::info('Land document uploaded', ['parcel_id' => $parcel->id, 'document_id' => $document->id]);

        return $document;
    }

    /**
     * Get land administration dashboard statistics
     */
    public function getDashboardStats(array $filters = []): array
    {
        $query = LandParcel::query();

        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        $parcels = $query->get();
        $compensations = Compensation::whereIn('parcel_id', $parcels->pluck('id'))->get();
        $disputes = LandDispute::whereIn('parcel_id', $parcels->pluck('id'))->get();
        $wayleaves = Wayleave::whereIn('parcel_id', $parcels->pluck('id'))->get();

        return [
            'total_parcels' => $parcels->count(),
            'acquired_parcels' => $parcels->where('acquisition_status', 'acquired')->count(),
            'disputed_parcels' => $parcels->where('acquisition_status', 'disputed')->count(),
            'total_area_ha' => round($parcels->sum('area_ha'), 2),
            'total_valuation' => $compensations->sum('valuation_amount'),
            'total_paid' => $compensations->sum('paid_amount'),
            'pending_payment' => $compensations->sum('valuation_amount') - $compensations->sum('paid_amount'),
            'active_disputes' => $disputes->where('status', '!=', 'resolved')->count(),
            'active_wayleaves' => $wayleaves->where('status', 'active')->count(),
            'expiring_wayleaves' => $wayleaves->filter(function ($w) {
                return $w->expiry_date && $w->expiry_date->diffInDays(now()) < 90;
            })->count(),
        ];
    }
}
