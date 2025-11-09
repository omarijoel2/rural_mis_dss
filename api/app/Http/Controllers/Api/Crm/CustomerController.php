<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Services\Crm\CustomerService;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $customerService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search']);
        $customers = $this->customerService->searchCustomers($filters, auth()->user());
        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $customer = $this->customerService->createCustomer($request->all(), auth()->user());
        return response()->json($customer, 201);
    }

    public function show(int $id)
    {
        $customer = $this->customerService->getCustomer($id, auth()->user());
        return response()->json($customer);
    }

    public function update(Request $request, int $id)
    {
        $customer = $this->customerService->updateCustomer($id, $request->all(), auth()->user());
        return response()->json($customer);
    }

    public function destroy(int $id)
    {
        $this->customerService->deleteCustomer($id, auth()->user());
        return response()->json(['message' => 'Customer deleted successfully'], 204);
    }
}
