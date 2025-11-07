<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RBACTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Permission::create(['name' => 'view schemes']);
        Permission::create(['name' => 'create schemes']);
        Permission::create(['name' => 'edit schemes']);
        Permission::create(['name' => 'delete schemes']);
        Permission::create(['name' => 'view audit']);
        Permission::create(['name' => 'view roles']);
    }

    public function test_user_with_permission_can_access_resource(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('view schemes');

        $this->actingAs($user);
        $response = $this->getJson('/api/schemes');
        $response->assertOk();
    }

    public function test_user_without_permission_cannot_access_resource(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        $response = $this->getJson('/api/schemes');
        $response->assertForbidden();
    }

    public function test_role_based_access_control(): void
    {
        $tenant = Tenant::factory()->create();
        
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['view schemes', 'create schemes', 'edit schemes', 'delete schemes']);
        
        $viewerRole = Role::create(['name' => 'Viewer']);
        $viewerRole->givePermissionTo('view schemes');

        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->assignRole('Admin');

        $viewer = User::factory()->create(['tenant_id' => $tenant->id]);
        $viewer->assignRole('Viewer');

        $this->actingAs($admin);
        $this->postJson('/api/schemes', ['name' => 'Test Scheme'])->assertSuccessful();

        $this->actingAs($viewer);
        $this->postJson('/api/schemes', ['name' => 'Test Scheme 2'])->assertForbidden();
        $this->getJson('/api/schemes')->assertOk();
    }

    public function test_permission_middleware_blocks_unauthorized_access(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        
        $response = $this->getJson('/api/audit/recent');
        $response->assertForbidden();

        $user->givePermissionTo('view audit');
        
        $response = $this->getJson('/api/audit/recent');
        $response->assertOk();
    }

    public function test_role_assignment_and_revocation(): void
    {
        $tenant = Tenant::factory()->create();
        $superAdmin = User::factory()->create(['tenant_id' => $tenant->id]);
        $superAdmin->givePermissionTo(['view roles', 'assign roles']);

        $targetUser = User::factory()->create(['tenant_id' => $tenant->id]);
        $role = Role::create(['name' => 'Manager']);

        $this->actingAs($superAdmin);
        
        $response = $this->postJson("/api/rbac/users/{$targetUser->id}/roles", [
            'role' => 'Manager',
        ]);
        $response->assertOk();

        $this->assertTrue($targetUser->fresh()->hasRole('Manager'));

        $response = $this->deleteJson("/api/rbac/users/{$targetUser->id}/roles/Manager");
        $response->assertOk();

        $this->assertFalse($targetUser->fresh()->hasRole('Manager'));
    }

    public function test_permission_hierarchy_respected(): void
    {
        $tenant = Tenant::factory()->create();
        
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(['view schemes', 'create schemes']);
        
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->assignRole('Admin');

        $this->assertTrue($user->can('view schemes'));
        $this->assertTrue($user->can('create schemes'));
        $this->assertFalse($user->can('delete schemes'));
    }

    public function test_cannot_escalate_own_permissions(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('view roles');

        $this->actingAs($user);

        $response = $this->postJson("/api/rbac/users/{$user->id}/permissions", [
            'permission' => 'delete schemes',
        ]);

        $response->assertForbidden();
        $this->assertFalse($user->fresh()->can('delete schemes'));
    }

    public function test_cannot_assign_role_without_permission(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $targetUser = User::factory()->create(['tenant_id' => $tenant->id]);
        
        Role::create(['name' => 'Manager']);

        $this->actingAs($user);

        $response = $this->postJson("/api/rbac/users/{$targetUser->id}/roles", [
            'role' => 'Manager',
        ]);

        $response->assertForbidden();
        $this->assertFalse($targetUser->fresh()->hasRole('Manager'));
    }

    public function test_permission_tampering_detected(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);

        $response = $this->postJson('/api/schemes', [
            'name' => 'Test',
            '_bypass_permissions' => true,
        ]);

        $response->assertForbidden();
    }

    public function test_role_removal_revokes_permissions(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        
        $role = Role::create(['name' => 'Editor']);
        $role->givePermissionTo('edit schemes');
        
        $user->assignRole('Editor');
        $this->assertTrue($user->can('edit schemes'));

        $user->removeRole('Editor');
        $this->assertFalse($user->can('edit schemes'));
    }
}
