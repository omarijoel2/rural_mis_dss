<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Core Operations Monitoring Middleware
 * 
 * Logs all Core Ops API requests with:
 * - Request/response timing
 * - User context and tenant information
 * - Error tracking and alerting
 * - Performance metrics
 */
class CoreOpsMonitoring
{
    /**
     * Handle an incoming request and log performance metrics.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $requestId = uniqid('req_', true);
        
        // Get user context (null-safe for unauthenticated requests)
        $user = auth()->user();
        $userId = $user?->id;
        $tenantId = $user?->tenant_id;
        
        // Log incoming request
        Log::channel('core_ops')->info('[Core Ops] Incoming Request', [
            'request_id' => $requestId,
            'method' => $request->method(),
            'path' => $request->path(),
            'user_id' => $userId,
            'tenant_id' => $tenantId,
            'ip' => $request->ip(),
            'authenticated' => $user !== null,
        ]);
        
        $response = null;
        $exception = null;
        
        try {
            // Process request
            $response = $next($request);
        } catch (\Throwable $e) {
            // Capture exception for logging
            $exception = $e;
            
            // Calculate execution time for exception case
            $executionTime = (microtime(true) - $startTime) * 1000;
            
            // Log exception details with full stack trace
            Log::channel('core_ops')->error('[Core Ops] Request Exception', [
                'request_id' => $requestId,
                'method' => $request->method(),
                'path' => $request->path(),
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'execution_time_ms' => round($executionTime, 2),
                'user_id' => $userId,
                'tenant_id' => $tenantId,
            ]);
            
            // Determine appropriate status code
            $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
            if ($statusCode < 400) {
                $statusCode = 500; // Ensure it's an error code
            }
            
            // Create error response with monitoring headers
            $response = response()->json([
                'error' => class_basename($e),
                'message' => app()->environment('production') ? 'Internal Server Error' : $e->getMessage(),
                'request_id' => $requestId,
            ], $statusCode);
            
            // Add monitoring headers to error response
            $response->headers->set('X-Request-ID', $requestId);
            $response->headers->set('X-Response-Time', round($executionTime, 2) . 'ms');
            $response->headers->set('X-Had-Exception', 'true');
            
            // Return the response (don't rethrow) so headers reach the client
            // Exception is already fully logged above
        } finally {
            // Always log completion metrics, even if exception occurred
            $executionTime = (microtime(true) - $startTime) * 1000; // milliseconds
            
            // ALWAYS log to performance channel (baseline telemetry for ALL requests)
            Log::channel('core_ops_performance')->info('[Core Ops] Request Performance', [
                'request_id' => $requestId,
                'path' => $request->path(),
                'execution_time_ms' => round($executionTime, 2),
                'user_id' => $userId,
                'tenant_id' => $tenantId,
                'had_exception' => $exception !== null,
                'slow_query' => $executionTime > 1000,
            ]);
            
            // Additional logging for slow queries
            if ($executionTime > 1000) {
                Log::channel('core_ops_performance')->warning('[Core Ops] Slow Query', [
                    'request_id' => $requestId,
                    'path' => $request->path(),
                    'execution_time_ms' => round($executionTime, 2),
                    'threshold_ms' => 1000,
                    'user_id' => $userId,
                    'tenant_id' => $tenantId,
                    'had_exception' => $exception !== null,
                ]);
            }
            
            // Alert on critical slow queries
            if ($executionTime > 2000) {
                Log::channel('core_ops_performance')->error('[Core Ops] CRITICAL SLOW QUERY', [
                    'request_id' => $requestId,
                    'path' => $request->path(),
                    'execution_time_ms' => round($executionTime, 2),
                    'threshold_ms' => 2000,
                    'had_exception' => $exception !== null,
                ]);
            }
            
            // Log successful response details (completion log)
            if ($response !== null) {
                // Determine log level based on response status and timing
                $logLevel = $this->determineLogLevel($response->getStatusCode(), $executionTime);
                
                // Log response completion
                Log::channel('core_ops')->{$logLevel}('[Core Ops] Request Completed', [
                    'request_id' => $requestId,
                    'method' => $request->method(),
                    'path' => $request->path(),
                    'status' => $response->getStatusCode(),
                    'execution_time_ms' => round($executionTime, 2),
                    'user_id' => $userId,
                    'tenant_id' => $tenantId,
                    'slow_query' => $executionTime > 1000,
                    'had_exception' => $exception !== null,
                ]);
                
                // Add custom headers for monitoring (if not already added during exception)
                if (!$response->headers->has('X-Request-ID')) {
                    $response->headers->set('X-Request-ID', $requestId);
                }
                if (!$response->headers->has('X-Response-Time')) {
                    $response->headers->set('X-Response-Time', round($executionTime, 2) . 'ms');
                }
            }
        }
        
        return $response;
    }
    
    /**
     * Determine appropriate log level based on status code and timing.
     */
    private function determineLogLevel(int $statusCode, float $executionTime): string
    {
        // Errors (4xx, 5xx)
        if ($statusCode >= 500) {
            return 'error';
        }
        
        if ($statusCode >= 400) {
            return 'warning';
        }
        
        // Slow queries
        if ($executionTime > 1000) {
            return 'warning';
        }
        
        // Normal responses
        return 'info';
    }
}
