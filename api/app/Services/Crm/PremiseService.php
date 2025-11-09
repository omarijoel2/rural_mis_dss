<?php

namespace App\Services\Crm;

use App\Models\CrmPremise;
use App\Models\Scheme;
use App\Models\Dma;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Collection;
use MatanYadaev\EloquentSpatial\Objects\Point;

class PremiseService
{
    public function createPremise(array $data, User $user): CrmPremise
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'scheme_id' => 'required|exists:schemes,id',
            'dma_id' => 'nullable|exists:dmas,id',
            'code' => 'required|string|max:50',
            'address' => 'required|string|max:500',
            'category' => 'required|in:residential,commercial,industrial,institutional,standpipe',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $scheme = Scheme::where('tenant_id', $tenantId)->findOrFail($data['scheme_id']);

        if (isset($data['dma_id'])) {
            $dma = Dma::where('tenant_id', $tenantId)->findOrFail($data['dma_id']);
        }

        $geom = new Point($data['latitude'], $data['longitude']);

        return CrmPremise::create([
            'tenant_id' => $tenantId,
            'scheme_id' => $data['scheme_id'],
            'dma_id' => $data['dma_id'] ?? null,
            'code' => $data['code'],
            'address' => $data['address'],
            'category' => $data['category'],
            'geom' => $geom,
            'meta' => $data['meta'] ?? null,
        ]);
    }

    public function updatePremise(int $premiseId, array $data, User $user): CrmPremise
    {
        $tenantId = $user->currentTenantId();

        $premise = CrmPremise::where('tenant_id', $tenantId)->findOrFail($premiseId);

        $validator = Validator::make($data, [
            'scheme_id' => 'sometimes|exists:schemes,id',
            'dma_id' => 'nullable|exists:dmas,id',
            'code' => 'sometimes|string|max:50',
            'address' => 'sometimes|string|max:500',
            'category' => 'sometimes|in:residential,commercial,industrial,institutional,standpipe',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        if (isset($data['latitude']) && isset($data['longitude'])) {
            $data['geom'] = new Point($data['latitude'], $data['longitude']);
            unset($data['latitude'], $data['longitude']);
        }

        $premise->update($data);
        return $premise->fresh();
    }

    public function getPremise(int $premiseId, User $user): CrmPremise
    {
        $tenantId = $user->currentTenantId();
        
        return CrmPremise::where('tenant_id', $tenantId)
            ->with(['scheme', 'dma', 'serviceConnections', 'complaints', 'raCases'])
            ->findOrFail($premiseId);
    }

    public function searchPremises(array $filters, User $user): Collection
    {
        $tenantId = $user->currentTenantId();

        $query = CrmPremise::where('tenant_id', $tenantId);

        if (isset($filters['scheme_id'])) {
            $query->where('scheme_id', $filters['scheme_id']);
        }

        if (isset($filters['dma_id'])) {
            $query->where('dma_id', $filters['dma_id']);
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%")
                  ->orWhere('address', 'ilike', "%{$search}%");
            });
        }

        return $query->with(['scheme', 'dma'])->get();
    }

    public function getPremisesNearPoint(float $lat, float $lng, int $radiusMeters, User $user): Collection
    {
        $tenantId = $user->currentTenantId();

        return CrmPremise::where('tenant_id', $tenantId)
            ->whereRaw("ST_DWithin(geom::geography, ST_MakePoint(?, ?)::geography, ?)", [$lng, $lat, $radiusMeters])
            ->with(['scheme', 'serviceConnections'])
            ->get();
    }
}
