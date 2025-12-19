<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmRaRule;
use Illuminate\Http\Request;

class RaRuleController extends Controller
{
    public function index()
    {
        $rules = CrmRaRule::where('tenant_id', auth()->user()->currentTenantId())
            ->orderBy('priority', 'desc')
            ->get();
        
        return response()->json($rules);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'rule_type' => 'required|in:zero_consumption,high_consumption,tampering,meter_fault,custom',
            'config' => 'required|array',
            'priority' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        $rule = CrmRaRule::create([
            'tenant_id' => auth()->user()->currentTenantId(),
            'name' => $request->name,
            'rule_type' => $request->rule_type,
            'config' => $request->config,
            'priority' => $request->priority,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json($rule, 201);
    }

    public function update(Request $request, int $id)
    {
        $rule = CrmRaRule::where('tenant_id', auth()->user()->currentTenantId())
            ->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'rule_type' => 'sometimes|in:zero_consumption,high_consumption,tampering,meter_fault,custom',
            'config' => 'sometimes|array',
            'priority' => 'sometimes|integer|min:1|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        $rule->update($request->only(['name', 'rule_type', 'config', 'priority', 'is_active']));

        return response()->json($rule);
    }

    public function destroy(int $id)
    {
        $rule = CrmRaRule::where('tenant_id', auth()->user()->currentTenantId())
            ->findOrFail($id);
        
        $rule->delete();
        
        return response()->json(['message' => 'Rule deleted successfully'], 204);
    }
}
