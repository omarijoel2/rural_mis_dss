<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFacilityRequest;
use App\Http\Requests\UpdateFacilityRequest;
use App\Models\Facility;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Point;

class FacilityController extends Controller
{
    public function index(Request $request)
    {
        $query = Facility::with(['scheme', 'tenant']);

        if ($request->has('scheme_id')) {
            $query->where('scheme_id', $request->scheme_id);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        $facilities = $query->paginate($request->get('per_page', 15));

        return response()->json($facilities);
    }

    public function store(StoreFacilityRequest $request)
    {
        $data = $request->validated();

        if (isset($data['location']) && is_array($data['location'])) {
            $data['location'] = Point::fromJson(json_encode($data['location']));
        }

        $facility = Facility::create($data);
        $facility->load(['scheme', 'tenant']);

        return response()->json($facility, 201);
    }

    public function show(Facility $facility)
    {
        $facility->load(['scheme', 'tenant', 'attachments']);
        return response()->json($facility);
    }

    public function update(UpdateFacilityRequest $request, Facility $facility)
    {
        $data = $request->validated();

        if (isset($data['location']) && is_array($data['location'])) {
            $data['location'] = Point::fromJson(json_encode($data['location']));
        }

        $facility->update($data);
        $facility->load(['scheme', 'tenant']);

        return response()->json($facility);
    }

    public function destroy(Facility $facility)
    {
        $facility->delete();
        return response()->json(['message' => 'Facility deleted successfully'], 204);
    }
}
