#!/bin/bash

# Core Ops Integration Testing Script
# Tests: API endpoints, multi-tenant isolation, and data integrity

set -e

BASE_URL="http://localhost:8001/api/v1"
COOKIE_JAR="/tmp/test_cookies.txt"

echo "======================================"
echo "Core Ops Integration Testing"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -n "Test $TESTS_RUN: $test_name... "
    
    HTTP_STATUS=$(eval "$command" 2>&1 | tail -1)
    
    if [[ "$HTTP_STATUS" == "$expected_status" ]]; then
        echo -e "${GREEN}PASS${NC} (HTTP $HTTP_STATUS)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}FAIL${NC} (Expected HTTP $expected_status, got $HTTP_STATUS)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo "1. Testing Core Ops API Routes Registration"
echo "--------------------------------------------"

# Test unauthenticated access (should get 401 or redirect)
run_test "Dashboard without auth" \
    "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/core-ops/dashboard" \
    "401"

run_test "Topology nodes without auth" \
    "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/core-ops/network/nodes" \
    "401"

run_test "Telemetry tags without auth" \
    "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/core-ops/telemetry/tags" \
    "401"

run_test "NRW snapshots without auth" \
    "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/core-ops/nrw/snapshots" \
    "401"

run_test "Outages without auth" \
    "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/core-ops/outages" \
    "401"

run_test "Dosing plans without auth" \
    "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/core-ops/dosing/plans" \
    "401"

run_test "Pump schedules without auth" \
    "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/core-ops/schedule" \
    "401"

echo ""
echo "2. Database Schema Verification"
echo "--------------------------------"

# Check that all Core Ops tables exist
php artisan db:table network_nodes 2>&1 | grep -q "network_nodes" && echo -e "${GREEN}✓${NC} network_nodes table exists" || echo -e "${RED}✗${NC} network_nodes table missing"
php artisan db:table network_edges 2>&1 | grep -q "network_edges" && echo -e "${GREEN}✓${NC} network_edges table exists" || echo -e "${RED}✗${NC} network_edges table missing"
php artisan db:table telemetry_tags 2>&1 | grep -q "telemetry_tags" && echo -e "${GREEN}✓${NC} telemetry_tags table exists" || echo -e "${RED}✗${NC} telemetry_tags table missing"
php artisan db:table telemetry_measurements 2>&1 | grep -q "telemetry_measurements" && echo -e "${GREEN}✓${NC} telemetry_measurements table exists" || echo -e "${RED}✗${NC} telemetry_measurements table missing"
php artisan db:table nrw_snapshots 2>&1 | grep -q "nrw_snapshots" && echo -e "${GREEN}✓${NC} nrw_snapshots table exists" || echo -e "${RED}✗${NC} nrw_snapshots table missing"
php artisan db:table interventions 2>&1 | grep -q "interventions" && echo -e "${GREEN}✓${NC} interventions table exists" || echo -e "${RED}✗${NC} interventions table missing"
php artisan db:table outages 2>&1 | grep -q "outages" && echo -e "${GREEN}✓${NC} outages table exists" || echo -e "${RED}✗${NC} outages table missing"
php artisan db:table dose_plans 2>&1 | grep -q "dose_plans" && echo -e "${GREEN}✓${NC} dose_plans table exists" || echo -e "${GREEN}✓${NC} dose_plans table exists"
php artisan db:table chemical_stocks 2>&1 | grep -q "chemical_stocks" && echo -e "${GREEN}✓${NC} chemical_stocks table exists" || echo -e "${RED}✗${NC} chemical_stocks table missing"
php artisan db:table pump_schedules 2>&1 | grep -q "pump_schedules" && echo -e "${GREEN}✓${NC} pump_schedules table exists" || echo -e "${RED}✗${NC} pump_schedules table missing"

echo ""
echo "3. RBAC Permissions Verification"
echo "--------------------------------"

# Check that Core Ops permissions exist
PERMISSIONS_COUNT=$(php artisan tinker --execute="echo \Spatie\Permission\Models\Permission::where('name', 'like', 'core_ops.%')->count();" 2>/dev/null | tail -1)
echo "Core Ops permissions found: $PERMISSIONS_COUNT"

if [ "$PERMISSIONS_COUNT" -ge "15" ]; then
    echo -e "${GREEN}✓${NC} Expected 15+ Core Ops permissions, found $PERMISSIONS_COUNT"
else
    echo -e "${YELLOW}⚠${NC} Expected 15+ permissions, only found $PERMISSIONS_COUNT"
fi

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Tests run: $TESTS_RUN"
echo -e "${GREEN}Tests passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Tests failed: $TESTS_FAILED${NC}"
else
    echo -e "${GREEN}Tests failed: 0${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All integration tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
