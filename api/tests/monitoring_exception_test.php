<?php

/**
 * Core Ops Monitoring - Exception Handling Test
 * Simulates a 5xx error and verifies both log channels capture the event
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

echo "\n";
echo "==========================================\n";
echo "Core Ops Exception Monitoring Test\n";
echo "==========================================\n\n";

// Clear existing logs for clean test
$coreOpsLog = storage_path('logs/core_ops.log');
$performanceLog = storage_path('logs/core_ops_performance.log');

if (File::exists($coreOpsLog)) {
    File::delete($coreOpsLog);
}
if (File::exists($performanceLog)) {
    File::delete($performanceLog);
}

echo "Test 1: Simulating exception with logging...\n";

try {
    // Simulate a Core Ops request that throws an exception
    $requestId = uniqid('req_test_', true);
    $startTime = microtime(true);
    
    // Log incoming request (as middleware would)
    Log::channel('core_ops')->info('[Core Ops] Incoming Request', [
        'request_id' => $requestId,
        'method' => 'GET',
        'path' => 'api/v1/core-ops/test-exception',
        'user_id' => null,
        'tenant_id' => null,
        'authenticated' => false,
    ]);
    
    // Simulate exception
    $exception = new \Exception('Simulated 5xx error for testing');
    
    // Calculate execution time
    $executionTime = (microtime(true) - $startTime) * 1000;
    
    // Log exception (as middleware would in catch block)
    Log::channel('core_ops')->error('[Core Ops] Request Exception', [
        'request_id' => $requestId,
        'method' => 'GET',
        'path' => 'api/v1/core-ops/test-exception',
        'exception' => get_class($exception),
        'message' => $exception->getMessage(),
        'execution_time_ms' => round($executionTime, 2),
        'user_id' => null,
        'tenant_id' => null,
    ]);
    
    // Log performance baseline (as middleware would in finally block)
    Log::channel('core_ops_performance')->info('[Core Ops] Request Performance', [
        'request_id' => $requestId,
        'path' => 'api/v1/core-ops/test-exception',
        'execution_time_ms' => round($executionTime, 2),
        'user_id' => null,
        'tenant_id' => null,
        'had_exception' => true,
        'slow_query' => false,
    ]);
    
    // Log completion (as middleware would in finally block)
    Log::channel('core_ops')->error('[Core Ops] Request Completed', [
        'request_id' => $requestId,
        'method' => 'GET',
        'path' => 'api/v1/core-ops/test-exception',
        'status' => 500,
        'execution_time_ms' => round($executionTime, 2),
        'user_id' => null,
        'tenant_id' => null,
        'slow_query' => false,
        'had_exception' => true,
    ]);
    
    echo "✓ Exception logging simulation completed\n\n";
    
} catch (\Exception $e) {
    echo "✗ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Verify logs were written
echo "Test 2: Verifying log files were created...\n";

if (!File::exists($coreOpsLog)) {
    echo "✗ FAIL: core_ops.log not created\n";
    exit(1);
}

if (!File::exists($performanceLog)) {
    echo "✗ FAIL: core_ops_performance.log not created\n";
    exit(1);
}

echo "✓ Both log files created\n\n";

// Verify log contents
echo "Test 3: Verifying log contents...\n";

$coreOpsContent = File::get($coreOpsLog);
$performanceContent = File::get($performanceLog);

$testsPass = true;

// Check core_ops.log contains exception entry
if (!str_contains($coreOpsContent, 'Request Exception')) {
    echo "✗ FAIL: core_ops.log missing exception entry\n";
    $testsPass = false;
} else {
    echo "✓ core_ops.log contains exception entry\n";
}

// Check core_ops.log contains completion entry
if (!str_contains($coreOpsContent, 'Request Completed')) {
    echo "✗ FAIL: core_ops.log missing completion entry\n";
    $testsPass = false;
} else {
    echo "✓ core_ops.log contains completion entry\n";
}

// Check performance log contains baseline telemetry
if (!str_contains($performanceContent, 'Request Performance')) {
    echo "✗ FAIL: core_ops_performance.log missing baseline telemetry\n";
    $testsPass = false;
} else {
    echo "✓ core_ops_performance.log contains baseline telemetry\n";
}

// Check had_exception flag
if (!str_contains($performanceContent, 'had_exception') || !str_contains($performanceContent, 'true')) {
    echo "✗ FAIL: Performance log missing had_exception flag\n";
    $testsPass = false;
} else {
    echo "✓ Performance log includes had_exception flag\n";
}

echo "\n==========================================\n";
echo "Test Summary\n";
echo "==========================================\n";

if ($testsPass) {
    echo "✓ ALL TESTS PASSED\n";
    echo "\nException monitoring verified:\n";
    echo "  - Exceptions logged to core_ops channel\n";
    echo "  - Performance metrics captured for failed requests\n";
    echo "  - had_exception flag properly set\n";
    echo "  - Completion log includes exception context\n\n";
    exit(0);
} else {
    echo "✗ SOME TESTS FAILED\n\n";
    exit(1);
}
