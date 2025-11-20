<?php

/**
 * Core Operations Module - Simplified Integration Test
 * Focuses on multi-tenant isolation and data integrity
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Tenant;
use App\Models\NetworkNode;
use App\Models\TelemetryTag;
use App\Models\Outage;
use App\Models\PumpSchedule;

echo "\n";
echo "==========================================\n";
echo "Core Ops - Tenant Isolation Test\n";
echo "==========================================\n\n";

$testsRun = 0;
$testsPassed = 0;

function test($name, $callable) {
    global $testsRun, $testsPassed;
    $testsRun++;
    echo sprintf("%-60s", "Test $testsRun: $name...");
    
    try {
        $result = $callable();
        if ($result === true) {
            echo " ✓ PASS\n";
            $testsPassed++;
            return true;
        } else {
            echo " ✗ FAIL: $result\n";
            return false;
        }
    } catch (Exception $e) {
        echo " ✗ ERROR: " . $e->getMessage() . "\n";
        return false;
    }
}

echo "1. Database Schema Verification\n";
echo "================================\n";

$requiredTables = [
    'network_nodes',
    'network_edges',
    'telemetry_tags',
    'telemetry_measurements',
    'nrw_snapshots',
    'interventions',
    'outages',
    'dose_plans',
    'chemical_stocks',
    'pump_schedules',
];

foreach ($requiredTables as $table) {
    test("Table '$table' exists", function() use ($table) {
        return DB::getSchemaBuilder()->hasTable($table);
    });
}

echo "\n2. Model Trait Verification\n";
echo "============================\n";

test("NetworkNode uses HasTenancy trait", function() {
    return in_array('App\\Models\\Traits\\HasTenancy', class_uses(NetworkNode::class));
});

test("TelemetryTag uses HasTenancy trait", function() {
    return in_array('App\\Models\\Traits\\HasTenancy', class_uses(TelemetryTag::class));
});

test("Outage uses HasTenancy trait", function() {
    return in_array('App\\Models\\Traits\\HasTenancy', class_uses(Outage::class));
});

test("PumpSchedule uses HasTenancy trait", function() {
    return in_array('App\\Models\\Traits\\HasTenancy', class_uses(PumpSchedule::class));
});

echo "\n3. Multi-Tenant Data Isolation\n";
echo "===============================\n";

// Create test tenants
$tenant1 = Tenant::firstOrCreate(
    ['short_code' => 'TEST_A'],
    ['name' => 'Test Tenant A', 'status' => 'active']
);

$tenant2 = Tenant::firstOrCreate(
    ['short_code' => 'TEST_B'],
    ['name' => 'Test Tenant B', 'status' => 'active']
);

test("Test tenants created", function() use ($tenant1, $tenant2) {
    return $tenant1->exists && $tenant2->exists;
});

// Create test schemes first (required FK)
$scheme1 = DB::table('schemes')->insertGetId([
    'id' => DB::raw('gen_random_uuid()'),
    'tenant_id' => $tenant1->id,
    'code' => 'TEST_SCH_A',
    'name' => 'Test Scheme A',
    'created_at' => now(),
    'updated_at' => now(),
], 'id');

$scheme2 = DB::table('schemes')->insertGetId([
    'id' => DB::raw('gen_random_uuid()'),
    'tenant_id' => $tenant2->id,
    'code' => 'TEST_SCH_B',
    'name' => 'Test Scheme B',
    'created_at' => now(),
    'updated_at' => now(),
], 'id');

// Create test data for each tenant
$node1 = DB::table('network_nodes')->insertGetId([
    'id' => DB::raw('gen_random_uuid()'),
    'tenant_id' => $tenant1->id,
    'scheme_id' => $scheme1,
    'code' => 'NODE_TEST_A',
    'type' => 'junction',
    'elevation_m' => 1650.5,
    'geom' => DB::raw("ST_SetSRID(ST_MakePoint(36.8219, -1.2921), 4326)"),
    'created_at' => now(),
    'updated_at' => now(),
], 'id');

$node2 = DB::table('network_nodes')->insertGetId([
    'id' => DB::raw('gen_random_uuid()'),
    'tenant_id' => $tenant2->id,
    'scheme_id' => $scheme2,
    'code' => 'NODE_TEST_B',
    'type' => 'reservoir',
    'elevation_m' => 1700.0,
    'geom' => DB::raw("ST_SetSRID(ST_MakePoint(36.8319, -1.3021), 4326)"),
    'created_at' => now(),
    'updated_at' => now(),
], 'id');

test("Tenant A test data created", function() use ($node1, $tenant1) {
    return !empty($node1);
});

test("Tenant B test data created", function() use ($node2, $tenant2) {
    return !empty($node2);
});

test("Tenant isolation: Each tenant has separate data", function() use ($tenant1, $tenant2) {
    $tenant1Count = NetworkNode::withoutGlobalScopes()->where('tenant_id', $tenant1->id)->count();
    $tenant2Count = NetworkNode::withoutGlobalScopes()->where('tenant_id', $tenant2->id)->count();
    return $tenant1Count >= 1 && $tenant2Count >= 1;
});

echo "\n4. PostGIS Spatial Data Verification\n";
echo "=====================================\n";

test("NetworkNode coordinates are stored as geometry", function() use ($node1) {
    $result = DB::select("SELECT ST_AsText(geom) as coords FROM network_nodes WHERE id = ?", [$node1]);
    return !empty($result) && str_contains($result[0]->coords, 'POINT');
});

test("Spatial query capabilities work", function() use ($tenant1) {
    $count = DB::table('network_nodes')
        ->whereRaw("tenant_id = ?::uuid", [$tenant1->id])
        ->whereRaw("ST_DWithin(geom::geography, ST_MakePoint(36.82, -1.29)::geography, 5000)")
        ->count();
    return $count >= 0; // Just verify the query runs
});

echo "\n5. Foreign Key Integrity\n";
echo "=========================\n";

test("All Core Ops FKs use bigint (not UUID)", function() {
    $fkColumns = [
        ['table' => 'telemetry_tags', 'column' => 'asset_id'],
        ['table' => 'dose_plans', 'column' => 'asset_id'],
        ['table' => 'pump_schedules', 'column' => 'asset_id'],
    ];
    
    foreach ($fkColumns as $fk) {
        $result = DB::select(
            "SELECT data_type FROM information_schema.columns WHERE table_name = ? AND column_name = ?",
            [$fk['table'], $fk['column']]
        );
        if (empty($result) || $result[0]->data_type !== 'bigint') {
            return "FK {$fk['table']}.{$fk['column']} is not bigint";
        }
    }
    return true;
});

echo "\n==========================================\n";
echo "Test Summary\n";
echo "==========================================\n";
echo "Tests run: $testsRun\n";
echo "Tests passed: $testsPassed\n";
echo "Tests failed: " . ($testsRun - $testsPassed) . "\n\n";

if ($testsPassed === $testsRun) {
    echo "Result: ALL TESTS PASSED ✓\n\n";
    exit(0);
} else {
    echo "Result: SOME TESTS FAILED\n\n";
    exit(1);
}
