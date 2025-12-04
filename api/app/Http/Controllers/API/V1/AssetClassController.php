<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetClassController extends Controller
{
    /**
     * Check if the current user is a Super Admin
     */
    private function isSuperAdmin(): bool
    {
        $user = auth()->user();
        return $user && $user->hasRole('Super Admin');
    }

    /**
     * Ensure only Super Admins can modify asset classes
     */
    private function authorizeModification(): void
    {
        if (!$this->isSuperAdmin()) {
            abort(403, 'Only Super Admins can modify asset classes. Asset classes are shared configuration across all counties.');
        }
    }

    public function index(Request $request)
    {
        $query = DB::table('asset_classes');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'ilike', "%{$search}%")
                  ->orWhere('name', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('criticality')) {
            $query->where('criticality', $request->criticality);
        }

        $classes = $query->orderBy('name')->get();

        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $this->authorizeModification();

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:asset_classes,code',
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:asset_classes,id',
            'criticality' => 'required|in:low,medium,high,critical',
            'attributes_schema' => 'nullable|array',
        ]);

        $id = DB::table('asset_classes')->insertGetId([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'criticality' => $validated['criticality'],
            'attributes_schema' => isset($validated['attributes_schema']) 
                ? json_encode($validated['attributes_schema']) 
                : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $assetClass = DB::table('asset_classes')->where('id', $id)->first();

        return response()->json($assetClass, 201);
    }

    public function show($id)
    {
        $assetClass = DB::table('asset_classes')->where('id', $id)->first();

        if (!$assetClass) {
            return response()->json(['message' => 'Asset class not found'], 404);
        }

        $assetClass->assets_count = DB::table('assets')->where('class_id', $id)->count();

        return response()->json($assetClass);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeModification();

        $assetClass = DB::table('asset_classes')->where('id', $id)->first();

        if (!$assetClass) {
            return response()->json(['message' => 'Asset class not found'], 404);
        }

        $validated = $request->validate([
            'code' => 'string|max:50|unique:asset_classes,code,' . $id,
            'name' => 'string|max:255',
            'parent_id' => 'nullable|integer|exists:asset_classes,id',
            'criticality' => 'in:low,medium,high,critical',
            'attributes_schema' => 'nullable|array',
        ]);

        $updateData = [
            'updated_at' => now(),
        ];

        if (isset($validated['code'])) $updateData['code'] = $validated['code'];
        if (isset($validated['name'])) $updateData['name'] = $validated['name'];
        if (array_key_exists('parent_id', $validated)) $updateData['parent_id'] = $validated['parent_id'];
        if (isset($validated['criticality'])) $updateData['criticality'] = $validated['criticality'];
        if (isset($validated['attributes_schema'])) {
            $updateData['attributes_schema'] = json_encode($validated['attributes_schema']);
        }

        DB::table('asset_classes')->where('id', $id)->update($updateData);

        $updated = DB::table('asset_classes')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        $this->authorizeModification();

        $assetClass = DB::table('asset_classes')->where('id', $id)->first();

        if (!$assetClass) {
            return response()->json(['message' => 'Asset class not found'], 404);
        }

        $assetsCount = DB::table('assets')->where('class_id', $id)->count();
        if ($assetsCount > 0) {
            return response()->json([
                'message' => 'Cannot delete asset class with existing assets',
                'assets_count' => $assetsCount
            ], 422);
        }

        $childrenCount = DB::table('asset_classes')->where('parent_id', $id)->count();
        if ($childrenCount > 0) {
            return response()->json([
                'message' => 'Cannot delete asset class with child classes',
                'children_count' => $childrenCount
            ], 422);
        }

        DB::table('asset_classes')->where('id', $id)->delete();

        return response()->json(['message' => 'Asset class deleted successfully'], 200);
    }

    public function tree()
    {
        $classes = DB::table('asset_classes')->orderBy('name')->get();
        
        $tree = $this->buildTree($classes->toArray());

        return response()->json($tree);
    }

    private function buildTree(array $elements, $parentId = null)
    {
        $branch = [];

        foreach ($elements as $element) {
            if ($element->parent_id == $parentId) {
                $children = $this->buildTree($elements, $element->id);
                if ($children) {
                    $element->children = $children;
                }
                $branch[] = $element;
            }
        }

        return $branch;
    }
}
