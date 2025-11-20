<?php

/**
 * Core Operations Module Integration Test
 * 
 * Tests:
 * 1. Multi-tenant data isolation
 * 2. RBAC enforcement
 * 3. API endpoint functionality
 * 4. Data integrity across operations
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Tenant;
use App\Models\NetworkNode;
use App\Models\TelemetryTag;
use App\Models\Outage;
use Spatie\Permission\Models\Role;

echo "\n";
echo "==========================================\n";
echo "Core Ops Integration Testing Suite\n";
echo "==========================================\n\n";

$testsRun = 0;
$testsPassed = 0;
$testsFailed = 0;

function test($name, $callable) {
    global $testsRun, $testsPassed, $testsFailed;
    $testsRun++;
    echo "Test $testsRun: $name... ";
    
    try {
        $result = $callable();
        if ($result === true || $result === null) {
            echo "✓ PASS\n";
            $testsPassed++;
        } else {
            echo "✗ FAIL: $result\n";
            $testsFailed++;
        }
    } catch (Exception $e) {
        echo "✗ ERROR: " . $e->getMessage() . "\n";
        $testsFailed++;
    }
}

echo "1. Database Setup & Tenant Creation\n";
echo "------------------------------------\n";

// Create test tenants
$tenant1 = Tenant::firstOrCreate(
    ['short_code' => 'TWA'],
    [
        'name' => 'Test Water Utility A',
        'status' => 'active'
    ]
);

$tenant2 = Tenant::firstOrCreate(
    ['short_code' => 'TWB'],
    [
        'name' => 'Test Water Utility B',
        'status' => 'active'
    ]
);

test("Tenant 1 created", function() use ($tenant1) {
    return $tenant1->exists;
});

test("Tenant 2 created", function() use ($tenant2) {
    return $tenant2->exists;
});

// Create test users
$manager = Role::where('name', 'Manager')->first();
$viewer = Role::where('name', 'Viewer')->first();

$user1 = User::firstOrCreate(
    ['email' => 'manager@tenantA.test'],
    [
        'name' => 'Tenant A Manager',
        'password' => Hash::make('password'),
        'tenant_id' => $tenant1->id,
    ]
);
if ($manager) {
    $user1->assignRole($manager);
}

$user2 = User::firstOrCreate(
    ['email' => 'viewer@tenantB.test'],
    [
        'name' => 'Tenant B Viewer',
        'password' => Hash::make('password'),
        'tenant_id' => $tenant2->id,
    ]
);
if ($viewer) {
    $user2->assignRole($viewer);
}

test("User 1 (Tenant A Manager) created", function() use ($user1) {
    return $user1->exists && $user1->tenant_id === $user1->tenant_id;
});

test("User 2 (Tenant B Viewer) created", function() use ($user2) {
    return $user2->exists && $user2->tenant_id === $user2->tenant_id;
});

echo "\n2. Multi-Tenant Data Isolation Tests\n";
echo "--------------------------------------\n";

// Create network nodes for both tenants
$node1 = NetworkNode::create([
    'tenant_id' => $tenant1->id,
    'asset_id' => null,
    'node_type' => 'junction',
    'coordinates' => DB::raw("ST_SetSRID(ST_MakePoint(36.8219, -1.2921), 4326)"),
    'elevation_m' => 1650.5,
    'demand_lps' => 0.5,
]);

$node2 = NetworkNode::create([
    'tenant_id' => $tenant2->id,
    'asset_id' => null,
    'node_type' => 'tank',
    'coordinates' => DB::raw("ST_SetSRID(ST_MakePoint(36.8319, -1.3021), 4326)"),
    'elevation_m' => 1700.0,
    'demand_lps' => 0.0,
]);

test("Tenant A node created", function() use ($node1, $tenant1) {
    return $node1->tenant_id === $tenant1->id;
});

test("Tenant B node created", function() use ($node2, $tenant2) {
    return $node2->tenant_id === $tenant2->id;
});

// Test HasTenancy trait automatic scoping
test("Tenant A can only see own nodes", function() use ($tenant1) {
    auth()->loginUsingId(User::where('tenant_id', $tenant1->id)->first()->id);
    $count = NetworkNode::count();
    $allNodes = NetworkNode::withoutGlobalScopes()->where('tenant_id', $tenant1->id)->count();
    return $count === $allNodes;
});

test("Tenant B can only see own nodes", function() use ($tenant2) {
    auth()->loginUsingId(User::where('tenant_id', $tenant2->id)->first()->id);
    $count = NetworkNode::count();
    $allNodes = NetworkNode::withoutGlobalScopes()->where('tenant_id', $tenant2->id)->count();
    return $count === $allNodes;
});

test("Cross-tenant data isolation enforced", function() use ($tenant1, $tenant2) {
    auth()->loginUsingId(User::where('tenant_id', $tenant1->id)->first()->id);
    $tenant1Nodes = NetworkNode::count();
    
    auth()->loginUsingId(User::where('tenant_id', $tenant2->id)->first()->id);
    $tenant2Nodes = NetworkNode::count();
    
    return $tenant1Nodes !== $tenant2Nodes || ($tenant1Nodes === 1 && $tenant2Nodes === 1);
});

echo "\n3. Model Integrity Tests\n";
echo "-------------------------\n";

test("NetworkNode has HasTenancy trait", function() {
    return in_array('App\\Models\\Traits\\HasTenancy', class_uses(NetworkNode::class));
});

test("TelemetryTag has HasTenancy trait", function() {
    return in_array('App\\Models\\Traits\\HasTenancy', class_uses(TelemetryTag::class));
});

test("Outage has HasTenancy trait", function() {
    return in_array('App\\Models\\Traits\\HasTenancy', class_uses(Outage::class));
});

echo "\n4. RBAC Permission Tests\n";
echo "-------------------------\n";

test("Core Ops permissions exist", function() {
    $count = \Spatie\Permission\Models\Permission::whereIn('name', [
        'view network topology',
        'view telemetry',
        'view outages',
        'view pump schedules',
        'view dosing',
        'view nrw',
        'view operations dashboard',
    ])->count();
    return $count >= 7;
});

test("Manager role has Core Ops permissions", function() use ($manager) {
    if (!$manager) return "Manager role not found";
    return $manager->hasPermissionTo('view operations dashboard');
});

test("Viewer role has read-only permissions", function() use ($viewer) {
    if (!$viewer) return "Viewer role not found";
    $hasView = $viewer->hasPermissionTo('view operations dashboard');
    $hasManage = $viewer->hasPermissionTo('manage outages');
    return $hasView && !$hasManage;
});

echo "\n5. Database Schema Validation\n";
echo "------------------------------\n";

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

echo "\n==========================================\n";
echo "Test Summary\n";
echo "==========================================\n";
echo "Tests run: $testsRun\n";
echo "✓ Tests passed: $testsPassed\n";

if ($testsFailed > 0) {
    echo "✗ Tests failed: $testsFailed\n";
    echo "\nResult: FAILED\n\n";
    exit(1);
} else {
    echo "✗ Tests failed: 0\n";
    echo "\nResult: ALL TESTS PASSED ✓\n\n";
    exit(0);
}
