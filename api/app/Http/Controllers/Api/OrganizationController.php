<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrganizationRequest;
use App\Http\Requests\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\Request;
use MatanYadaev\EloquentSpatial\Objects\Polygon;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $query = Organization::with(['tenant']);

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('org_code', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $organizations = $query->paginate($request->get('per_page', 15));

        return response()->json($organizations);
    }

    public function store(StoreOrganizationRequest $request)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        $organization = Organization::create($data);
        $organization->load(['tenant']);

        return response()->json($organization, 201);
    }

    public function show(Organization $organization)
    {
        $organization->load(['tenant', 'schemes']);
        return response()->json($organization);
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization)
    {
        $data = $request->validated();

        if (isset($data['geom']) && is_array($data['geom'])) {
            $data['geom'] = Polygon::fromJson(json_encode($data['geom']));
        }

        $organization->update($data);
        $organization->load(['tenant']);

        return response()->json($organization);
    }

    public function destroy(Organization $organization)
    {
        $organization->delete();
        return response()->json(['message' => 'Organization deleted successfully'], 204);
    }
}
