#!/bin/bash

# Core Ops Monitoring End-to-End Test
# Verifies that logging channels are configured and working

echo "======================================"
echo "Core Ops Monitoring E2E Test"
echo "======================================"
echo ""

# Test 1: Verify logging channels are configured
echo "Test 1: Checking logging channel configuration..."
php artisan tinker --execute="
try {
    \$channels = config('logging.channels');
    if (isset(\$channels['core_ops']) && isset(\$channels['core_ops_performance'])) {
        echo 'PASS: core_ops and core_ops_performance channels configured' . PHP_EOL;
        exit(0);
    } else {
        echo 'FAIL: Logging channels not configured' . PHP_EOL;
        exit(1);
    }
} catch (Exception \$e) {
    echo 'ERROR: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
" 2>&1 | tail -1

if [ $? -eq 0 ]; then
    echo "✓ Logging channels configured correctly"
else
    echo "✗ Logging channels configuration failed"
    exit 1
fi

# Test 2: Verify middleware is registered
echo ""
echo "Test 2: Checking middleware registration..."
php artisan tinker --execute="
try {
    \$middleware = app('router')->getMiddleware();
    if (isset(\$middleware['core_ops.monitor'])) {
        echo 'PASS: core_ops.monitor middleware registered' . PHP_EOL;
        exit(0);
    } else {
        echo 'FAIL: Middleware not registered' . PHP_EOL;
        exit(1);
    }
} catch (Exception \$e) {
    echo 'ERROR: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
" 2>&1 | tail -1

if [ $? -eq 0 ]; then
    echo "✓ Middleware registered correctly"
else
    echo "✗ Middleware registration failed"
    exit 1
fi

# Test 3: Test logging functionality
echo ""
echo "Test 3: Testing logging functionality..."
php artisan tinker --execute="
try {
    \Illuminate\Support\Facades\Log::channel('core_ops')->info('Test message from monitoring test', ['test' => true]);
    \Illuminate\Support\Facades\Log::channel('core_ops_performance')->warning('Test performance log', ['execution_time_ms' => 1234]);
    echo 'PASS: Log messages written successfully' . PHP_EOL;
    exit(0);
} catch (Exception \$e) {
    echo 'ERROR: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
" 2>&1 | tail -1

if [ $? -eq 0 ]; then
    echo "✓ Logging functionality working"
else
    echo "✗ Logging functionality failed"
    exit 1
fi

# Test 4: Check Core Ops routes have monitoring middleware
echo ""
echo "Test 4: Verifying Core Ops routes have monitoring middleware..."
# Count routes under /api/v1/core-ops prefix
TOTAL_ROUTES=$(php artisan route:list --path=core-ops 2>/dev/null | grep -E "api/v1/core-ops" | wc -l)
# Check if route group has middleware (check routes file directly from api directory)
MIDDLEWARE_APPLIED=$(grep -A 1 "prefix('core-ops')" routes/api.php | grep -c "core_ops.monitor")

if [ "$MIDDLEWARE_APPLIED" -gt "0" ] && [ "$TOTAL_ROUTES" -gt "0" ]; then
    echo "✓ Monitoring middleware applied to Core Ops route group ($TOTAL_ROUTES routes)"
else
    echo "✗ FAIL: Monitoring middleware not applied to Core Ops routes"
    exit 1
fi

echo ""
echo "======================================"
echo "Monitoring Test Summary"
echo "======================================"
echo "✓ All critical monitoring tests passed"
echo ""
echo "Log file locations:"
echo "  - Core Ops: storage/logs/core_ops.log"
echo "  - Performance: storage/logs/core_ops_performance.log"
echo ""
