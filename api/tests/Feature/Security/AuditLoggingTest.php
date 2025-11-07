<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Models\Tenant;
use App\Models\CoreRegistry\Scheme;
use App\Models\Security\AuditEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLoggingTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_action_is_audited(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('create schemes');

        $this->actingAs($user);
        
        $this->assertEquals(0, AuditEvent::count());

        $response = $this->postJson('/api/schemes', [
            'name' => 'Test Scheme',
            'scheme_type' => 'piped',
            'status' => 'operational',
        ]);

        $response->assertSuccessful();
        
        $this->assertEquals(1, AuditEvent::count());
        
        $audit = AuditEvent::first();
        $this->assertEquals($user->id, $audit->user_id);
        $this->assertEquals($tenant->id, $audit->tenant_id);
        $this->assertEquals('scheme.created', $audit->action);
        $this->assertEquals('Scheme', $audit->resource_type);
    }

    public function test_update_action_is_audited(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo(['edit schemes']);

        $scheme = Scheme::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        
        $response = $this->putJson("/api/schemes/{$scheme->id}", [
            'name' => 'Updated Scheme',
        ]);

        $response->assertOk();
        
        $audit = AuditEvent::where('action', 'scheme.updated')->first();
        $this->assertNotNull($audit);
        $this->assertEquals($scheme->id, $audit->resource_id);
        $this->assertArrayHasKey('old_values', $audit->metadata);
        $this->assertArrayHasKey('new_values', $audit->metadata);
    }

    public function test_delete_action_is_audited(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('delete schemes');

        $scheme = Scheme::factory()->create(['tenant_id' => $tenant->id]);
        $schemeId = $scheme->id;

        $this->actingAs($user);
        
        $response = $this->deleteJson("/api/schemes/{$schemeId}");
        $response->assertOk();
        
        $audit = AuditEvent::where('action', 'scheme.deleted')->first();
        $this->assertNotNull($audit);
        $this->assertEquals($schemeId, $audit->resource_id);
    }

    public function test_failed_login_is_audited(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized();
        
        $audit = AuditEvent::where('action', 'auth.login_failed')->first();
        $this->assertNotNull($audit);
        $this->assertEquals('test@example.com', $audit->metadata['email'] ?? null);
    }

    public function test_audit_log_contains_ip_and_user_agent(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('create schemes');

        $this->actingAs($user);
        
        $response = $this->postJson('/api/schemes', [
            'name' => 'Test Scheme',
            'scheme_type' => 'piped',
            'status' => 'operational',
        ], [
            'HTTP_USER_AGENT' => 'Test User Agent',
            'REMOTE_ADDR' => '192.168.1.1',
        ]);

        $audit = AuditEvent::first();
        $this->assertEquals('192.168.1.1', $audit->ip_address);
        $this->assertEquals('Test User Agent', $audit->user_agent);
    }

    public function test_audit_export_respects_permissions(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('view audit');

        AuditEvent::factory()->count(5)->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        
        $response = $this->getJson('/api/audit/export');
        $response->assertForbidden();

        $user->givePermissionTo('export audit');
        
        $response = $this->getJson('/api/audit/export');
        $response->assertOk();
    }

    public function test_cannot_modify_audit_logs(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('view audit');

        $audit = AuditEvent::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        
        $response = $this->putJson("/api/audit/{$audit->id}", [
            'action' => 'tampered.action',
        ]);

        $response->assertStatus(405);
        
        $audit->refresh();
        $this->assertNotEquals('tampered.action', $audit->action);
    }

    public function test_cannot_delete_audit_logs(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('view audit');

        $audit = AuditEvent::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        
        $response = $this->deleteJson("/api/audit/{$audit->id}");
        $response->assertStatus(405);
        
        $this->assertDatabaseHas('audit_events', ['id' => $audit->id]);
    }

    public function test_security_events_trigger_audit_logs(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->assertEquals(0, AuditEvent::where('action', 'LIKE', 'security.%')->count());

        $this->actingAs($user);
        $this->getJson('/api/schemes')->assertForbidden();

        $securityAudit = AuditEvent::where('action', 'LIKE', 'security.%')->first();
        $this->assertNotNull($securityAudit);
    }

    public function test_audit_log_immutability(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $audit = AuditEvent::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'test.action',
            'resource_type' => 'Test',
            'resource_id' => '123',
        ]);

        $originalData = $audit->toArray();

        try {
            $audit->update(['action' => 'modified.action']);
        } catch (\Exception $e) {
        }

        $audit->refresh();
        $this->assertEquals($originalData['action'], $audit->action);
    }
}
