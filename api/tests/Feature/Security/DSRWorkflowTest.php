<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Security\DsrRequest;
use App\Models\Security\Consent;
use App\Services\Security\DsrService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DSRWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected DsrService $dsrService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dsrService = app(DsrService::class);
    }

    public function test_user_can_request_data_export(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->givePermissionTo('process dsr requests');

        $this->actingAs($user);
        
        $response = $this->postJson('/api/dsr/request', [
            'request_type' => 'export',
            'reason' => 'I want to see my data',
        ]);

        $response->assertSuccessful();
        
        $dsr = DsrRequest::where('user_id', $user->id)->first();
        $this->assertNotNull($dsr);
        $this->assertEquals('export', $dsr->request_type);
        $this->assertEquals('pending', $dsr->status);
    }

    public function test_user_can_request_data_deletion(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        
        $response = $this->postJson('/api/dsr/request', [
            'request_type' => 'deletion',
            'reason' => 'I want my data deleted',
        ]);

        $response->assertSuccessful();
        
        $dsr = DsrRequest::where('user_id', $user->id)->first();
        $this->assertEquals('deletion', $dsr->request_type);
    }

    public function test_admin_can_process_dsr_request(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->givePermissionTo('process dsr requests');

        $dsr = DsrRequest::create([
            'tenant_id' => $tenant->id,
            'user_id' => $admin->id,
            'request_type' => 'export',
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $this->actingAs($admin);
        
        $response = $this->postJson("/api/dsr/{$dsr->id}/process");
        $response->assertOk();
        
        $dsr->refresh();
        $this->assertEquals('processing', $dsr->status);
    }

    public function test_admin_can_complete_dsr_request(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->givePermissionTo('process dsr requests');

        $dsr = DsrRequest::create([
            'tenant_id' => $tenant->id,
            'user_id' => $admin->id,
            'request_type' => 'export',
            'status' => 'processing',
            'requested_at' => now(),
        ]);

        $this->actingAs($admin);
        
        $response = $this->postJson("/api/dsr/{$dsr->id}/complete", [
            'data_payload' => ['user_data' => 'exported data'],
        ]);
        $response->assertOk();
        
        $dsr->refresh();
        $this->assertEquals('completed', $dsr->status);
        $this->assertNotNull($dsr->completed_at);
        $this->assertArrayHasKey('user_data', $dsr->data_payload);
    }

    public function test_admin_can_reject_dsr_request(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->givePermissionTo('reject dsr requests');

        $dsr = DsrRequest::create([
            'tenant_id' => $tenant->id,
            'user_id' => $admin->id,
            'request_type' => 'deletion',
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $this->actingAs($admin);
        
        $response = $this->postJson("/api/dsr/{$dsr->id}/reject", [
            'reason' => 'Cannot comply with deletion request',
        ]);
        $response->assertOk();
        
        $dsr->refresh();
        $this->assertEquals('rejected', $dsr->status);
    }

    public function test_dsr_export_includes_user_data(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $exportedData = $this->dsrService->exportUserData($user);
        
        $this->assertArrayHasKey('user', $exportedData);
        $this->assertArrayHasKey('audit_trail', $exportedData);
        $this->assertArrayHasKey('consents', $exportedData);
        
        $this->assertEquals('John Doe', $exportedData['user']['name']);
        $this->assertEquals('john@example.com', $exportedData['user']['email']);
    }

    public function test_consent_management(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('manage consents');

        $this->actingAs($user);
        
        $response = $this->postJson('/api/consents/grant', [
            'purpose' => 'marketing',
            'scope' => 'email communication',
        ]);
        $response->assertSuccessful();
        
        $consent = Consent::where('user_id', $user->id)->first();
        $this->assertEquals('marketing', $consent->purpose);
        $this->assertEquals('granted', $consent->status);
    }

    public function test_consent_withdrawal(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->givePermissionTo('manage consents');

        $consent = Consent::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'purpose' => 'analytics',
            'scope' => 'usage tracking',
            'status' => 'granted',
            'granted_at' => now(),
        ]);

        $this->actingAs($user);
        
        $response = $this->postJson("/api/consents/{$consent->id}/revoke");
        $response->assertOk();
        
        $consent->refresh();
        $this->assertEquals('revoked', $consent->status);
        $this->assertNotNull($consent->revoked_at);
    }

    public function test_dsr_request_respects_tenant_isolation(): void
    {
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user1->givePermissionTo('view dsr requests');

        $dsr1 = DsrRequest::create([
            'tenant_id' => $tenant1->id,
            'user_id' => $user1->id,
            'request_type' => 'export',
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $dsr2 = DsrRequest::create([
            'tenant_id' => $tenant2->id,
            'user_id' => $user1->id,
            'request_type' => 'export',
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $this->actingAs($user1);
        $response = $this->getJson('/api/dsr/pending');
        $response->assertOk();
        
        $requests = $response->json('dsr_requests');
        $this->assertCount(1, $requests);
        $this->assertEquals($tenant1->id, $requests[0]['tenant_id']);
    }

    public function test_cannot_process_another_users_dsr_request(): void
    {
        $tenant = Tenant::factory()->create();
        $user1 = User::factory()->create(['tenant_id' => $tenant->id]);
        $user2 = User::factory()->create(['tenant_id' => $tenant->id]);
        $user2->givePermissionTo('process dsr requests');

        $dsr = DsrRequest::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user1->id,
            'request_type' => 'export',
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $this->actingAs($user1);
        
        $response = $this->postJson("/api/dsr/{$dsr->id}/process");
        $response->assertForbidden();
    }

    public function test_dsr_rate_limiting(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);

        for ($i = 0; $i < 3; $i++) {
            $response = $this->postJson('/api/dsr/request', [
                'request_type' => 'export',
                'reason' => "Request {$i}",
            ]);
            $response->assertSuccessful();
        }

        $response = $this->postJson('/api/dsr/request', [
            'request_type' => 'export',
            'reason' => 'Too many requests',
        ]);
        
        $response->assertStatus(429);
    }

    public function test_completed_dsr_cannot_be_reprocessed(): void
    {
        $tenant = Tenant::factory()->create();
        $admin = User::factory()->create(['tenant_id' => $tenant->id]);
        $admin->givePermissionTo('process dsr requests');

        $dsr = DsrRequest::create([
            'tenant_id' => $tenant->id,
            'user_id' => $admin->id,
            'request_type' => 'export',
            'status' => 'completed',
            'requested_at' => now(),
            'completed_at' => now(),
        ]);

        $this->actingAs($admin);
        
        $response = $this->postJson("/api/dsr/{$dsr->id}/process");
        $response->assertStatus(422);
    }

    public function test_consent_cannot_be_granted_for_another_user(): void
    {
        $tenant = Tenant::factory()->create();
        $user1 = User::factory()->create(['tenant_id' => $tenant->id]);
        $user2 = User::factory()->create(['tenant_id' => $tenant->id]);
        $user1->givePermissionTo('manage consents');

        $this->actingAs($user1);
        
        $response = $this->postJson('/api/consents/grant', [
            'user_id' => $user2->id,
            'purpose' => 'marketing',
            'scope' => 'email',
        ]);

        $response->assertForbidden();
    }

    public function test_invalid_dsr_request_type_rejected(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user);
        
        $response = $this->postJson('/api/dsr/request', [
            'request_type' => 'invalid_type',
            'reason' => 'Test',
        ]);

        $response->assertStatus(422);
    }
}
