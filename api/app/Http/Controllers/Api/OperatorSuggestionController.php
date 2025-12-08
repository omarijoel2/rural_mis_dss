<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Models\MeterRoute;
use App\Models\User;
use App\Models\Asset;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OperatorSuggestionController extends Controller
{
    public function getSuggestedOperators(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->currentTenantId();
        
        $now = Carbon::now();
        $assetId = $request->query('asset_id');
        $schemeId = $request->query('scheme_id');
        $dmaId = $request->query('dma_id');
        $scheduledFor = $request->query('scheduled_for');
        
        if ($assetId) {
            $asset = Asset::find($assetId);
            if ($asset) {
                if (!$schemeId && $asset->scheme_id) {
                    $schemeId = $asset->scheme_id;
                }
                if (!$dmaId && $asset->dma_id) {
                    $dmaId = $asset->dma_id;
                }
            }
        }
        
        if ($scheduledFor) {
            $targetTime = Carbon::parse($scheduledFor);
        } else {
            $targetTime = $now;
        }
        
        $suggestions = [];
        $onShiftOperators = [];
        $routeOperators = [];
        
        $activeShiftsQuery = Shift::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->where('starts_at', '<=', $targetTime)
            ->where('ends_at', '>=', $targetTime);
        
        if ($schemeId) {
            $activeShiftsQuery->where('scheme_id', $schemeId);
        }
        if ($dmaId) {
            $activeShiftsQuery->where('dma_id', $dmaId);
        }
        
        $activeShifts = $activeShiftsQuery->with('supervisor')->get();
        
        foreach ($activeShifts as $shift) {
            if ($shift->supervisor) {
                $onShiftOperators[$shift->supervisor->id] = [
                    'id' => $shift->supervisor->id,
                    'name' => $shift->supervisor->name,
                    'email' => $shift->supervisor->email,
                    'source' => 'on_shift',
                    'shift_name' => $shift->name,
                    'shift_ends_at' => $shift->ends_at->format('H:i'),
                    'priority' => 1,
                ];
            }
        }
        
        $routesQuery = MeterRoute::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereNotNull('assigned_to');
        
        if ($schemeId) {
            $routesQuery->where('scheme_id', $schemeId);
        }
        if ($dmaId) {
            $routesQuery->where('dma_id', $dmaId);
        }
        
        $routes = $routesQuery->with('assignedTo')->get();
        
        foreach ($routes as $route) {
            if ($route->assignedTo && !isset($onShiftOperators[$route->assignedTo->id])) {
                $routeOperators[$route->assignedTo->id] = [
                    'id' => $route->assignedTo->id,
                    'name' => $route->assignedTo->name,
                    'email' => $route->assignedTo->email,
                    'source' => 'route_assigned',
                    'route_name' => $route->name,
                    'route_code' => $route->route_code,
                    'priority' => 2,
                ];
            }
        }
        
        $suggestions = array_merge(
            array_values($onShiftOperators),
            array_values($routeOperators)
        );
        
        usort($suggestions, function($a, $b) {
            return $a['priority'] - $b['priority'];
        });
        
        $allOperators = User::query()
            ->where(function($query) use ($tenantId) {
                $query->where('current_tenant_id', $tenantId)
                    ->orWhereHas('tenants', function($q) use ($tenantId) {
                        $q->where('tenant_id', $tenantId);
                    });
            })
            ->where(function($query) {
                $query->whereHas('roles', function($q) {
                    $q->whereIn('name', ['Operator', 'Technician', 'Field Staff', 'Maintenance Staff', 'County Admin']);
                })
                ->orWhereHas('permissions', function($q) {
                    $q->where('name', 'receive work orders');
                });
            })
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get()
            ->map(function($user) use ($suggestions) {
                $isSuggested = collect($suggestions)->firstWhere('id', $user->id);
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_suggested' => !!$isSuggested,
                    'suggestion_reason' => $isSuggested ? $isSuggested['source'] : null,
                ];
            });
        
        return response()->json([
            'suggested' => $suggestions,
            'all_operators' => $allOperators,
            'has_suggestions' => count($suggestions) > 0,
        ]);
    }
}
