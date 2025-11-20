<?php

namespace App\Http\Controllers\Api\Traits;

use App\Models\Scheme;
use App\Models\Dma;
use App\Models\Facility;
use App\Models\Asset;
use App\Models\NetworkNode;
use Illuminate\Validation\ValidationException;

trait ValidatesTenantOwnership
{
    protected function validateTenantScheme(?string $schemeId, string $tenantId): void
    {
        if ($schemeId && !Scheme::where('id', $schemeId)->where('tenant_id', $tenantId)->exists()) {
            throw ValidationException::withMessages([
                'scheme_id' => ['The selected scheme does not belong to your organization.']
            ]);
        }
    }

    protected function validateTenantDma(?string $dmaId, string $tenantId): void
    {
        if ($dmaId && !Dma::where('id', $dmaId)->where('tenant_id', $tenantId)->exists()) {
            throw ValidationException::withMessages([
                'dma_id' => ['The selected DMA does not belong to your organization.']
            ]);
        }
    }

    protected function validateTenantFacility(?string $facilityId, string $tenantId): void
    {
        if ($facilityId && !Facility::where('id', $facilityId)->where('tenant_id', $tenantId)->exists()) {
            throw ValidationException::withMessages([
                'facility_id' => ['The selected facility does not belong to your organization.']
            ]);
        }
    }

    protected function validateTenantAsset(?string $assetId, string $tenantId): void
    {
        if ($assetId && !Asset::where('id', $assetId)->where('tenant_id', $tenantId)->exists()) {
            throw ValidationException::withMessages([
                'asset_id' => ['The selected asset does not belong to your organization.']
            ]);
        }
    }

    protected function validateTenantNode(?string $nodeId, string $tenantId, string $attribute = 'node_id'): void
    {
        if ($nodeId && !NetworkNode::where('id', $nodeId)->where('tenant_id', $tenantId)->exists()) {
            throw ValidationException::withMessages([
                $attribute => ['The selected network node does not belong to your organization.']
            ]);
        }
    }
}
