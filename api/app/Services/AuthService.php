<?php

namespace App\Services;

use App\Models\User;
use App\Models\DeviceTrust;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class AuthService
{
    protected AuditService $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Authenticate user with email and password
     */
    public function login(string $email, string $password, ?string $deviceFingerprint = null, ?string $tenantId = null): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            $this->auditService->log(
                'auth.login.failed',
                null,
                User::class,
                $user?->id,
                ['email' => $email]
            );

            throw new \Exception('Invalid credentials');
        }

        if ($user->two_factor_enabled) {
            $tempToken = Str::random(64);
            
            // Get accessible tenants for 2FA flow
            $accessibleTenants = $user->getAccessibleTenants();
            
            $this->auditService->log(
                'auth.2fa_required',
                $user->id,
                User::class,
                $user->id,
                ['email' => $email]
            );

            return [
                'requires_2fa' => true,
                'temp_token' => $tempToken,
                'user_id' => $user->id,
                'is_super_admin' => $user->isSuperAdmin(),
                'accessible_tenants' => $accessibleTenants,
            ];
        }

        return $this->completeLogin($user, $deviceFingerprint, $tenantId);
    }

    /**
     * Verify 2FA code and complete login
     */
    public function verifyTwoFactor(string $userId, string $code, ?string $deviceFingerprint = null, ?string $tenantId = null): array
    {
        $user = User::findOrFail($userId);

        $isValid = $user->verifyTwoFactorCode($code) || $user->verifyBackupCode($code);

        if (!$isValid) {
            $this->auditService->log(
                'auth.2fa.failed',
                $user->id,
                User::class,
                $user->id,
                ['code' => substr($code, 0, 2) . '****']
            );

            throw new \Exception('Invalid 2FA code');
        }

        $this->auditService->log(
            'auth.2fa.success',
            $user->id,
            User::class,
            $user->id
        );

        return $this->completeLogin($user, $deviceFingerprint, $tenantId);
    }

    /**
     * Complete login and issue token
     * Handles tenant selection based on user role:
     * - Super Admin: Can select any active tenant
     * - County Admin: Auto-assigned to their tenant(s)
     */
    protected function completeLogin(User $user, ?string $deviceFingerprint = null, ?string $tenantId = null): array
    {
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

        if ($deviceFingerprint) {
            $this->trustDevice($user, $deviceFingerprint);
        }

        // Get accessible tenants for the user
        $accessibleTenants = $user->getAccessibleTenants();
        $isSuperAdmin = $user->isSuperAdmin();

        // Handle tenant selection
        $requiresTenantSelection = false;
        $selectedTenant = null;

        if ($tenantId && $user->canAccessTenant($tenantId)) {
            // Tenant was specified and user has access
            $user->switchTenant($tenantId);
            $selectedTenant = $user->load('currentTenant')->currentTenant;
        } elseif ($accessibleTenants->count() === 1 && !$isSuperAdmin) {
            // County admin with single tenant - auto-select
            $user->switchTenant($accessibleTenants->first()->id);
            $selectedTenant = $accessibleTenants->first();
        } elseif ($accessibleTenants->count() > 0) {
            // Multiple tenants available - require selection
            $requiresTenantSelection = true;
        }

        $this->auditService->log(
            'auth.login.success',
            $user->id,
            User::class,
            $user->id,
            [
                'email' => $user->email,
                'is_super_admin' => $isSuperAdmin,
                'selected_tenant' => $selectedTenant?->county,
            ]
        );

        // Load user with roles and permissions
        $user->load(['currentTenant', 'roles', 'permissions']);
        
        // Get role names for frontend
        $roleNames = $user->roles->pluck('name')->toArray();
        $permissionNames = $user->getAllPermissions()->pluck('name')->toArray();
        
        return [
            'token' => $token,
            'user' => array_merge($user->toArray(), [
                'role_names' => $roleNames,
                'permission_names' => $permissionNames,
            ]),
            'requires_2fa' => false,
            'requires_tenant_selection' => $requiresTenantSelection,
            'is_super_admin' => $isSuperAdmin,
            'accessible_tenants' => $accessibleTenants,
            'current_tenant' => $selectedTenant,
        ];
    }

    /**
     * Logout user and revoke token
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();

        $this->auditService->log(
            'auth.logout',
            $user->id,
            User::class,
            $user->id
        );
    }

    /**
     * Enroll user in 2FA
     */
    public function enrollTwoFactor(User $user): array
    {
        $secret = $user->generateTwoFactorSecret();
        $qrCodeUrl = $user->getTwoFactorQrCodeUrl();

        $this->auditService->log(
            'auth.2fa.enrolled',
            $user->id,
            User::class,
            $user->id
        );

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
        ];
    }

    /**
     * Enable 2FA after verification
     */
    public function enableTwoFactor(User $user, string $code): array
    {
        if (!$user->verifyTwoFactorCode($code)) {
            throw new \Exception('Invalid verification code');
        }

        $user->enableTwoFactor();

        $this->auditService->log(
            'auth.2fa.enabled',
            $user->id,
            User::class,
            $user->id
        );

        return [
            'enabled' => true,
            'backup_codes' => $user->backup_codes,
        ];
    }

    /**
     * Disable 2FA
     */
    public function disableTwoFactor(User $user, string $password): void
    {
        if (!Hash::check($password, $user->password)) {
            throw new \Exception('Invalid password');
        }

        $user->disableTwoFactor();

        $this->auditService->log(
            'auth.2fa.disabled',
            $user->id,
            User::class,
            $user->id
        );
    }

    /**
     * Trust a device for this user
     */
    protected function trustDevice(User $user, string $deviceFingerprint): void
    {
        DeviceTrust::updateOrCreate(
            [
                'user_id' => $user->id,
                'device_fingerprint' => $deviceFingerprint,
            ],
            [
                'device_name' => request()->userAgent(),
                'device_type' => $this->detectDeviceType(),
                'trusted_at' => now(),
                'expires_at' => now()->addDays(30),
                'last_seen_at' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]
        );
    }

    /**
     * Check if device is trusted
     */
    public function isDeviceTrusted(User $user, string $deviceFingerprint): bool
    {
        $device = DeviceTrust::where('user_id', $user->id)
            ->where('device_fingerprint', $deviceFingerprint)
            ->first();

        return $device && $device->isValid();
    }

    /**
     * Detect device type from user agent
     */
    protected function detectDeviceType(): string
    {
        $userAgent = request()->userAgent();
        
        if (preg_match('/mobile|android|iphone|ipad/i', $userAgent)) {
            return 'mobile';
        }
        
        if (preg_match('/tablet|ipad/i', $userAgent)) {
            return 'tablet';
        }
        
        return 'desktop';
    }

    /**
     * Refresh access token
     */
    public function refreshToken(User $user): string
    {
        $user->currentAccessToken()?->delete();
        
        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

        $this->auditService->log(
            'auth.token.refreshed',
            $user->id,
            User::class,
            $user->id
        );

        return $token;
    }
}
