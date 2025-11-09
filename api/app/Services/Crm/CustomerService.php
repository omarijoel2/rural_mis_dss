<?php

namespace App\Services\Crm;

use App\Models\CrmCustomer;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Collection;

class CustomerService
{
    public function createCustomer(array $data, User $user): CrmCustomer
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'id_no' => 'nullable|string|max:50',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'alt_contact' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return CrmCustomer::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'id_no' => $data['id_no'] ?? null,
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'alt_contact' => $data['alt_contact'] ?? null,
            'meta' => $data['meta'] ?? null,
        ]);
    }

    public function updateCustomer(int $customerId, array $data, User $user): CrmCustomer
    {
        $tenantId = $user->currentTenantId();

        $customer = CrmCustomer::where('tenant_id', $tenantId)->findOrFail($customerId);

        $validator = Validator::make($data, [
            'name' => 'sometimes|string|max:255',
            'id_no' => 'nullable|string|max:50',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
            'alt_contact' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $customer->update($data);
        return $customer->fresh();
    }

    public function getCustomer(int $customerId, User $user): CrmCustomer
    {
        $tenantId = $user->currentTenantId();
        
        return CrmCustomer::where('tenant_id', $tenantId)
            ->with(['serviceConnections', 'interactions', 'complaints'])
            ->findOrFail($customerId);
    }

    public function searchCustomers(array $filters, User $user): Collection
    {
        $tenantId = $user->currentTenantId();

        $query = CrmCustomer::where('tenant_id', $tenantId);

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id_no', 'like', "%{$search}%");
            });
        }

        return $query->with('serviceConnections')->get();
    }

    public function deleteCustomer(int $customerId, User $user): bool
    {
        $tenantId = $user->currentTenantId();

        $customer = CrmCustomer::where('tenant_id', $tenantId)->findOrFail($customerId);

        if ($customer->serviceConnections()->exists()) {
            throw ValidationException::withMessages([
                'customer' => ['Cannot delete customer with active service connections.']
            ]);
        }

        return $customer->delete();
    }
}
