<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditMiddleware
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Handle an incoming request and log audit events
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (Auth::check() && $this->shouldAudit($request)) {
            $this->auditService->log(
                $this->getActionName($request),
                Auth::id(),
                null,
                null,
                $this->getChanges($request),
                $this->getSeverity($request, $response)
            );
        }

        return $response;
    }

    /**
     * Determine if request should be audited
     */
    protected function shouldAudit(Request $request): bool
    {
        return !in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])
            && !str_contains($request->path(), 'health');
    }

    /**
     * Get action name from request
     */
    protected function getActionName(Request $request): string
    {
        $method = strtolower($request->method());
        $path = str_replace(['/', '-'], ['.', '_'], trim($request->path(), '/'));
        
        return "{$method}.{$path}";
    }

    /**
     * Get changes from request
     */
    protected function getChanges(Request $request): array
    {
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $request->except(['password', 'password_confirmation', 'token']);
        }

        return [];
    }

    /**
     * Determine severity based on response
     */
    protected function getSeverity(Request $request, $response): string
    {
        $status = $response->status();

        if ($status >= 500) {
            return 'error';
        }

        if ($status >= 400) {
            return 'warning';
        }

        if ($request->method() === 'DELETE') {
            return 'warning';
        }

        return 'info';
    }
}
