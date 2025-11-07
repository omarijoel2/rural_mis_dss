<?php

namespace App\Services;

use App\Models\KmsKey;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class KmsService
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Generate a new encryption key
     */
    public function generateKey(string $purpose, string $algorithm = 'AES-256', ?int $expiryDays = null): KmsKey
    {
        $keyId = 'key_' . Str::random(32);
        $rawKey = base64_encode(random_bytes(32));

        $key = KmsKey::create([
            'key_id' => $keyId,
            'key_type' => 'symmetric',
            'algorithm' => $algorithm,
            'purpose' => $purpose,
            'encrypted_key' => Crypt::encryptString($rawKey),
            'is_active' => true,
            'rotated_at' => now(),
            'expires_at' => $expiryDays ? now()->addDays($expiryDays) : null,
        ]);

        $this->auditService->log(
            'kms.key.generated',
            null,
            KmsKey::class,
            $key->id,
            ['purpose' => $purpose, 'algorithm' => $algorithm]
        );

        return $key;
    }

    /**
     * Get active key for purpose
     */
    public function getActiveKey(string $purpose): ?KmsKey
    {
        return KmsKey::active()
            ->purpose($purpose)
            ->orderBy('rotated_at', 'desc')
            ->first();
    }

    /**
     * Rotate encryption key
     */
    public function rotateKey(KmsKey $oldKey): KmsKey
    {
        $oldKey->deactivate();

        $newKey = $this->generateKey(
            $oldKey->purpose,
            $oldKey->algorithm,
            $oldKey->expires_at ? $oldKey->expires_at->diffInDays(now()) : null
        );

        $this->auditService->log(
            'kms.key.rotated',
            null,
            KmsKey::class,
            $newKey->id,
            [
                'old_key_id' => $oldKey->key_id,
                'new_key_id' => $newKey->key_id,
                'purpose' => $oldKey->purpose,
            ],
            'warning'
        );

        return $newKey;
    }

    /**
     * Encrypt data using KMS key
     */
    public function encrypt(string $data, string $purpose): array
    {
        $key = $this->getActiveKey($purpose);

        if (!$key) {
            $key = $this->generateKey($purpose);
        }

        $rawKey = Crypt::decryptString($key->encrypted_key);
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', $rawKey, 0, $iv);

        return [
            'encrypted_data' => base64_encode($encrypted),
            'iv' => base64_encode($iv),
            'key_id' => $key->key_id,
        ];
    }

    /**
     * Decrypt data using KMS key
     */
    public function decrypt(string $encryptedData, string $iv, string $keyId): string
    {
        $key = KmsKey::where('key_id', $keyId)->firstOrFail();
        $rawKey = Crypt::decryptString($key->encrypted_key);

        $decrypted = openssl_decrypt(
            base64_decode($encryptedData),
            'AES-256-CBC',
            $rawKey,
            0,
            base64_decode($iv)
        );

        if ($decrypted === false) {
            throw new \Exception('Decryption failed');
        }

        return $decrypted;
    }

    /**
     * Get keys that need rotation
     */
    public function getKeysNeedingRotation(int $daysThreshold = 90): \Illuminate\Support\Collection
    {
        return KmsKey::active()
            ->get()
            ->filter(fn($key) => $key->needsRotation($daysThreshold));
    }

    /**
     * Rotate all keys that need rotation
     */
    public function rotateAllExpiredKeys(int $daysThreshold = 90): array
    {
        $rotatedKeys = [];
        $keysNeedingRotation = $this->getKeysNeedingRotation($daysThreshold);

        foreach ($keysNeedingRotation as $oldKey) {
            $newKey = $this->rotateKey($oldKey);
            $rotatedKeys[] = [
                'old_key_id' => $oldKey->key_id,
                'new_key_id' => $newKey->key_id,
                'purpose' => $oldKey->purpose,
            ];
        }

        return $rotatedKeys;
    }
}
