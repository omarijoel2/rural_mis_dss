<?php

namespace Tests\Feature\Security;

use App\Models\Tenant;
use App\Models\User;
use App\Services\Security\EncryptionService;
use App\Services\Security\MaskingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EncryptionTest extends TestCase
{
    use RefreshDatabase;

    protected EncryptionService $encryptionService;
    protected MaskingService $maskingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->encryptionService = app(EncryptionService::class);
        $this->maskingService = app(MaskingService::class);
    }

    public function test_sensitive_data_is_encrypted(): void
    {
        $originalData = 'secret information';
        
        $encrypted = $this->encryptionService->encrypt($originalData);
        
        $this->assertNotEquals($originalData, $encrypted);
        $this->assertStringContainsString(':', $encrypted);
    }

    public function test_encrypted_data_can_be_decrypted(): void
    {
        $originalData = 'secret information';
        
        $encrypted = $this->encryptionService->encrypt($originalData);
        $decrypted = $this->encryptionService->decrypt($encrypted);
        
        $this->assertEquals($originalData, $decrypted);
    }

    public function test_json_encryption_preserves_structure(): void
    {
        $originalData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'age' => 30,
        ];
        
        $encrypted = $this->encryptionService->encryptJson($originalData);
        $decrypted = $this->encryptionService->decryptJson($encrypted);
        
        $this->assertEquals($originalData, $decrypted);
    }

    public function test_masking_hides_sensitive_data(): void
    {
        $email = 'john.doe@example.com';
        $masked = $this->maskingService->maskEmail($email);
        
        $this->assertStringStartsWith('j***', $masked);
        $this->assertStringEndsWith('@example.com', $masked);
        $this->assertNotEquals($email, $masked);
    }

    public function test_phone_masking(): void
    {
        $phone = '+1234567890';
        $masked = $this->maskingService->maskPhone($phone);
        
        $this->assertStringContainsString('***', $masked);
        $this->assertNotEquals($phone, $masked);
    }

    public function test_credit_card_masking(): void
    {
        $card = '4111111111111111';
        $masked = $this->maskingService->maskCreditCard($card);
        
        $this->assertStringStartsWith('****', $masked);
        $this->assertStringEndsWith('1111', $masked);
        $this->assertEquals(16, strlen($card));
    }

    public function test_pii_data_masking_in_logs(): void
    {
        $data = [
            'email' => 'user@example.com',
            'phone' => '+1234567890',
            'name' => 'John Doe',
        ];
        
        $masked = $this->maskingService->maskPII($data);
        
        $this->assertNotEquals($data['email'], $masked['email']);
        $this->assertNotEquals($data['phone'], $masked['phone']);
        $this->assertEquals($data['name'], $masked['name']);
    }

    public function test_encryption_uses_different_keys_per_operation(): void
    {
        $originalData = 'secret';
        
        $encrypted1 = $this->encryptionService->encrypt($originalData);
        $encrypted2 = $this->encryptionService->encrypt($originalData);
        
        $this->assertNotEquals($encrypted1, $encrypted2);
        
        $this->assertEquals($originalData, $this->encryptionService->decrypt($encrypted1));
        $this->assertEquals($originalData, $this->encryptionService->decrypt($encrypted2));
    }

    public function test_tampered_encrypted_data_fails_decryption(): void
    {
        $originalData = 'secret';
        $encrypted = $this->encryptionService->encrypt($originalData);
        
        $tampered = substr($encrypted, 0, -5) . 'xxxxx';
        
        $this->expectException(\Exception::class);
        $this->encryptionService->decrypt($tampered);
    }

    public function test_invalid_ciphertext_format_rejected(): void
    {
        $this->expectException(\Exception::class);
        $this->encryptionService->decrypt('not-a-valid-ciphertext');
    }

    public function test_empty_data_encryption_handled(): void
    {
        $encrypted = $this->encryptionService->encrypt('');
        $decrypted = $this->encryptionService->decrypt($encrypted);
        
        $this->assertEquals('', $decrypted);
    }

    public function test_null_data_masking_handled_safely(): void
    {
        $data = [
            'email' => null,
            'phone' => null,
        ];
        
        $masked = $this->maskingService->maskPII($data);
        
        $this->assertNull($masked['email']);
        $this->assertNull($masked['phone']);
    }

    public function test_malformed_json_encryption_fails_gracefully(): void
    {
        $this->expectException(\Exception::class);
        $this->encryptionService->decryptJson('invalid-json-cipher');
    }

    public function test_encryption_key_rotation_preserves_data(): void
    {
        $originalData = 'sensitive data';
        $encrypted1 = $this->encryptionService->encrypt($originalData);
        
        $decrypted1 = $this->encryptionService->decrypt($encrypted1);
        $this->assertEquals($originalData, $decrypted1);
        
        $encrypted2 = $this->encryptionService->encrypt($decrypted1);
        $decrypted2 = $this->encryptionService->decrypt($encrypted2);
        
        $this->assertEquals($originalData, $decrypted2);
    }
}
