<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use App\Models\Address;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $query = Address::with(['scheme', 'tenant']);
        
        if (auth()->user()) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('city')) {
            $query->where('city', 'ilike', "%{$request->city}%");
        }

        if ($request->has('ward')) {
            $query->where('ward', 'ilike', "%{$request->ward}%");
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('premise_code', 'ilike', "%{$search}%")
                  ->orWhere('street', 'ilike', "%{$search}%")
                  ->orWhere('village', 'ilike', "%{$search}%");
            });
        }

        $addresses = $query->paginate($request->get('per_page', 15));

        return response()->json($addresses);
    }

    public function store(StoreAddressRequest $request)
    {
        $data = $request->validated();

        if (isset($data['location']) && is_array($data['location'])) {
            $data['location'] = Point::fromJson(json_encode($data['location']));
        }

        $address = Address::create($data);
        $address->load(['scheme', 'tenant']);

        return response()->json($address, 201);
    }

    public function show(Address $address)
    {
        $address->load(['scheme', 'tenant']);
        return response()->json($address);
    }

    public function update(UpdateAddressRequest $request, Address $address)
    {
        $data = $request->validated();

        if (isset($data['location']) && is_array($data['location'])) {
            $data['location'] = Point::fromJson(json_encode($data['location']));
        }

        $address->update($data);
        $address->load(['scheme', 'tenant']);

        return response()->json($address);
    }

    public function destroy(Address $address)
    {
        $address->delete();
        return response()->json(['message' => 'Address deleted successfully'], 204);
    }
}
