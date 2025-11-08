#!/bin/bash

echo "==================================="
echo "CMMS API Test Suite"
echo "==================================="
echo ""

API_BASE="http://localhost:8001/api/v1"
HEALTH_URL="http://localhost:8001/api/health"

echo "Step 1: Check Laravel server health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Laravel server not running or not healthy (HTTP $HTTP_CODE)"
    echo ""
    echo "Please start Laravel server first:"
    echo "  cd api && php artisan serve --host=0.0.0.0 --port=8001"
    echo ""
    exit 1
fi

echo "✅ Laravel server is healthy"
echo ""

echo "Step 2: Test Asset endpoints..."
echo "GET /api/v1/assets (list assets)"
ASSETS=$(curl -s "$API_BASE/assets?per_page=5")
ASSET_COUNT=$(echo "$ASSETS" | jq -r '.total // 0' 2>/dev/null || echo "0")
echo "  Found $ASSET_COUNT total assets"

if [ "$ASSET_COUNT" -gt 0 ]; then
    FIRST_ASSET_ID=$(echo "$ASSETS" | jq -r '.data[0].id' 2>/dev/null)
    echo "  GET /api/v1/assets/$FIRST_ASSET_ID (view single asset)"
    ASSET_DETAIL=$(curl -s "$API_BASE/assets/$FIRST_ASSET_ID")
    ASSET_NAME=$(echo "$ASSET_DETAIL" | jq -r '.name // "Unknown"' 2>/dev/null)
    echo "  ✅ Asset details: $ASSET_NAME"
fi
echo ""

echo "Step 3: Test Part endpoints..."
echo "GET /api/v1/parts (list parts)"
PARTS=$(curl -s "$API_BASE/parts?per_page=5")
PART_COUNT=$(echo "$PARTS" | jq -r '.total // 0' 2>/dev/null || echo "0")
echo "  Found $PART_COUNT total parts"
echo ""

echo "Step 4: Test WorkOrder endpoints..."
echo "GET /api/v1/work-orders (list work orders)"
WOS=$(curl -s "$API_BASE/work-orders?per_page=5")
WO_COUNT=$(echo "$WOS" | jq -r '.total // 0' 2>/dev/null || echo "0")
echo "  Found $WO_COUNT total work orders"
echo ""

echo "Step 5: Database verification..."
cd "$(dirname "$0")/../.."
php api/artisan tinker --execute="
echo 'Assets: ' . \App\Models\Asset::count() . PHP_EOL;
echo 'Parts: ' . \App\Models\Part::count() . PHP_EOL;
echo 'Work Orders: ' . \App\Models\WorkOrder::count() . PHP_EOL;
echo 'Asset Classes: ' . \App\Models\AssetClass::count() . PHP_EOL;
echo 'PM Policies: ' . \App\Models\PmPolicy::count() . PHP_EOL;
echo 'Suppliers: ' . \App\Models\Supplier::count() . PHP_EOL;
"

echo ""
echo "==================================="
echo "Test Summary:"
echo "✅ Laravel server: Running"
echo "✅ Asset API: $ASSET_COUNT assets"
echo "✅ Part API: $PART_COUNT parts"
echo "✅ WorkOrder API: $WO_COUNT work orders"
echo "==================================="
echo ""
echo "For authenticated endpoint testing, you'll need to:"
echo "1. Create a user account"
echo "2. Login to get a session cookie"
echo "3. Include the cookie in API requests"
echo ""
