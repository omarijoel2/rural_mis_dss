<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WqParameter;
use Illuminate\Http\Request;

class WqParameterController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view water quality parameters');

        $query = WqParameter::query();

        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        $parameters = $query->paginate($request->get('per_page', 15));

        return response()->json($parameters);
    }

    public function store(Request $request)
    {
        $this->authorize('create water quality parameters');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:wq_parameters,code',
            'group' => 'required|in:physical,chemical,biological',
            'unit' => 'nullable|string|max:50',
            'method' => 'nullable|string|max:255',
            'who_limit' => 'nullable|numeric',
            'wasreb_limit' => 'nullable|numeric',
            'local_limit' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);

        $parameter = WqParameter::create($validated);

        return response()->json($parameter, 201);
    }

    public function show(int $parameterId)
    {
        $this->authorize('view water quality parameters');

        $parameter = WqParameter::findOrFail($parameterId);

        return response()->json($parameter);
    }

    public function update(int $parameterId, Request $request)
    {
        $this->authorize('edit water quality parameters');

        $parameter = WqParameter::findOrFail($parameterId);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:100|unique:wq_parameters,code,' . $parameterId,
            'group' => 'sometimes|in:physical,chemical,biological',
            'unit' => 'nullable|string|max:50',
            'method' => 'nullable|string|max:255',
            'who_limit' => 'nullable|numeric',
            'wasreb_limit' => 'nullable|numeric',
            'local_limit' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);

        $parameter->update($validated);

        return response()->json($parameter);
    }

    public function destroy(int $parameterId)
    {
        $this->authorize('delete water quality parameters');

        $parameter = WqParameter::findOrFail($parameterId);
        $parameter->delete();

        return response()->json(['message' => 'Parameter deleted successfully'], 204);
    }
}
