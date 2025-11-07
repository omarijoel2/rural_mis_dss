<?php

namespace App\Services;

use App\Models\Consent;
use App\Models\User;
use Illuminate\Support\Collection;

class ConsentService
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Grant consent
     */
    public function grantConsent(
        User $user,
        string $purpose,
        array $dataTypes,
        string $consentText,
        string $version,
        ?int $expiryDays = null
    ): Consent {
        $consent = Consent::create([
            'tenant_id' => $user->current_tenant_id,
            'user_id' => $user->id,
            'purpose' => $purpose,
            'data_types' => $dataTypes,
            'granted_at' => now(),
            'expires_at' => $expiryDays ? now()->addDays($expiryDays) : null,
            'consent_text' => $consentText,
            'version' => $version,
        ]);

        $this->auditService->log(
            'consent.granted',
            $user->id,
            Consent::class,
            $consent->id,
            ['purpose' => $purpose, 'data_types' => $dataTypes]
        );

        return $consent;
    }

    /**
     * Revoke consent
     */
    public function revokeConsent(Consent $consent): void
    {
        $consent->revoke();

        $this->auditService->log(
            'consent.revoked',
            $consent->user_id,
            Consent::class,
            $consent->id,
            ['purpose' => $consent->purpose],
            'warning'
        );
    }

    /**
     * Check if user has active consent for purpose
     */
    public function hasConsent(User $user, string $purpose, ?array $dataTypes = null): bool
    {
        $query = Consent::active()
            ->where('user_id', $user->id)
            ->purpose($purpose);

        if ($dataTypes) {
            $query->where(function ($q) use ($dataTypes) {
                foreach ($dataTypes as $type) {
                    $q->whereJsonContains('data_types', $type);
                }
            });
        }

        return $query->exists();
    }

    /**
     * Get all active consents for user
     */
    public function getUserConsents(User $user): Collection
    {
        return Consent::active()
            ->where('user_id', $user->id)
            ->get();
    }

    /**
     * Get consents expiring soon
     */
    public function getExpiringSoon(int $days = 30): Collection
    {
        return Consent::active()
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now(), now()->addDays($days)])
            ->get();
    }

    /**
     * Renew consent
     */
    public function renewConsent(Consent $consent, int $expiryDays): void
    {
        $consent->expires_at = now()->addDays($expiryDays);
        $consent->save();

        $this->auditService->log(
            'consent.renewed',
            $consent->user_id,
            Consent::class,
            $consent->id,
            ['new_expiry' => $consent->expires_at]
        );
    }
}
