<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Models\Tenant;
use App\Models\CoreRegistry\Scheme;
use App\Models\Security\AuditEvent;
use App\Models\Security\SecurityAlert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_cannot_access_other_tenants_data(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user2 = User::factory()->create(['tenant_id' => $tenant2->id]);

        $scheme1 = Scheme::factory()->create(['tenant_id' => $tenant1->id]);
        $scheme2 = Scheme::factory()->create(['tenant_id' => $tenant2->id]);

        $this->actingAs($user1);

        $response = $this->getJson("/api/schemes/{$scheme1->id}");
        $response->assertOk();

        $response = $this->getJson("/api/schemes/{$scheme2->id}");
        $response->assertNotFound();
    }

    public function test_audit_events_are_tenant_isolated(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user2 = User::factory()->create(['tenant_id' => $tenant2->id]);

        AuditEvent::create([
            'tenant_id' => $tenant1->id,
            'user_id' => $user1->id,
            'action' => 'test.action',
            'resource_type' => 'Scheme',
            'resource_id' => '123',
        ]);

        AuditEvent::create([
            'tenant_id' => $tenant2->id,
            'user_id' => $user2->id,
            'action' => 'test.action',
            'resource_type' => 'Scheme',
            'resource_id' => '456',
        ]);

        $this->actingAs($user1);
        $response = $this->getJson('/api/audit/recent');
        $response->assertOk();
        
        $events = $response->json('audit_events');
        $this->assertCount(1, $events);
        $this->assertEquals($tenant1->id, $events[0]['tenant_id']);
    }

    public function test_security_alerts_are_tenant_isolated(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        
        SecurityAlert::create([
            'tenant_id' => $tenant1->id,
            'alert_type' => 'failed_login',
            'severity' => 'medium',
            'description' => 'Tenant 1 alert',
            'metadata' => [],
        ]);

        SecurityAlert::create([
            'tenant_id' => $tenant2->id,
            'alert_type' => 'failed_login',
            'severity' => 'high',
            'description' => 'Tenant 2 alert',
            'metadata' => [],
        ]);

        $this->actingAs($user1);
        $response = $this->getJson('/api/security-alerts/unresolved');
        $response->assertOk();
        
        $alerts = $response->json('alerts');
        $this->assertCount(1, $alerts);
        $this->assertEquals($tenant1->id, $alerts[0]['tenant_id']);
    }

    public function test_cross_tenant_query_injection_blocked(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $scheme2 = Scheme::factory()->create(['tenant_id' => $tenant2->id]);

        $this->actingAs($user1);

        $maliciousQuery = [
            'tenant_id' => $tenant2->id,
        ];

        $response = $this->getJson('/api/schemes?' . http_build_query($maliciousQuery));
        $response->assertOk();
        
        $schemes = $response->json('schemes');
        foreach ($schemes as $scheme) {
            $this->assertEquals($tenant1->id, $scheme['tenant_id']);
        }
    }

    public function test_cannot_create_resource_for_another_tenant(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user1->givePermissionTo('create schemes');

        $this->actingAs($user1);

        $response = $this->postJson('/api/schemes', [
            'name' => 'Malicious Scheme',
            'tenant_id' => $tenant2->id,
            'scheme_type' => 'piped',
            'status' => 'operational',
        ]);

        $response->assertSuccessful();
        
        $scheme = Scheme::latest()->first();
        $this->assertEquals($tenant1->id, $scheme->tenant_id);
        $this->assertNotEquals($tenant2->id, $scheme->tenant_id);
    }

    public function test_cannot_update_resource_to_different_tenant(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user1->givePermissionTo('edit schemes');

        $scheme = Scheme::factory()->create(['tenant_id' => $tenant1->id]);

        $this->actingAs($user1);

        $response = $this->putJson("/api/schemes/{$scheme->id}", [
            'name' => 'Updated',
            'tenant_id' => $tenant2->id,
        ]);

        $scheme->refresh();
        $this->assertEquals($tenant1->id, $scheme->tenant_id);
    }

    public function test_sql_injection_in_tenant_filter_blocked(): void
    {
        $tenant1 = Tenant::factory()->create();
        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);

        Scheme::factory()->count(3)->create(['tenant_id' => $tenant1->id]);

        $this->actingAs($user1);

        $maliciousFilter = "1' OR '1'='1";
        $response = $this->getJson("/api/schemes?search={$maliciousFilter}");
        
        $response->assertOk();
        $schemes = $response->json('schemes');
        
        foreach ($schemes as $scheme) {
            $this->assertEquals($tenant1->id, $scheme['tenant_id']);
        }
    }

    public function test_unauthorized_tenant_switch_blocked(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);

        $this->actingAs($user1);

        $response = $this->postJson('/api/auth/switch-tenant', [
            'tenant_id' => $tenant2->id,
        ]);

        $response->assertStatus(403);
        
        $this->assertEquals($tenant1->id, $user1->fresh()->current_tenant_id);
    }
}
