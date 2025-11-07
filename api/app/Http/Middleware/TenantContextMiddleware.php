<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TenantContextMiddleware
{
    /**
     * Handle an incoming request and set tenant context
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user->current_tenant_id) {
            $request->attributes->set('tenant_id', $user->current_tenant_id);
            
            DB::statement('SET app.current_tenant_id = ?', [$user->current_tenant_id]);
        }

        return $next($request);
    }
}
