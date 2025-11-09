<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use PragmaRX\Google2FA\Google2FA;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, HasUuids, SoftDeletes, Notifiable, HasApiTokens, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google2fa_secret',
        'two_factor_enabled',
        'backup_codes',
        'current_tenant_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
        'backup_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_enabled' => 'boolean',
        'backup_codes' => 'array',
    ];

    /**
     * Get the current tenant ID for multitenancy scoping.
     * Guards against null tenant context.
     *
     * @throws \RuntimeException if no tenant is selected
     */
    public function currentTenantId(): string
    {
        if (!$this->current_tenant_id) {
            throw new \RuntimeException('No tenant selected for current user session');
        }
        
        return $this->current_tenant_id;
    }

    /**
     * Get the current tenant context
     */
    public function currentTenant()
    {
        return $this->belongsTo(Tenant::class, 'current_tenant_id');
    }

    /**
     * Get all tenants this user has access to
     */
    public function tenants()
    {
        return $this->belongsToMany(Tenant::class, 'tenant_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Generate 2FA secret
     */
    public function generateTwoFactorSecret(): string
    {
        $google2fa = new Google2FA();
        $this->google2fa_secret = $google2fa->generateSecretKey();
        $this->save();
        
        return $this->google2fa_secret;
    }

    /**
     * Enable two-factor authentication
     */
    public function enableTwoFactor(): void
    {
        $this->two_factor_enabled = true;
        $this->backup_codes = $this->generateBackupCodes();
        $this->save();
    }

    /**
     * Disable two-factor authentication
     */
    public function disableTwoFactor(): void
    {
        $this->two_factor_enabled = false;
        $this->google2fa_secret = null;
        $this->backup_codes = null;
        $this->save();
    }

    /**
     * Verify 2FA code
     */
    public function verifyTwoFactorCode(string $code): bool
    {
        if (!$this->google2fa_secret) {
            return false;
        }

        $google2fa = new Google2FA();
        return $google2fa->verifyKey($this->google2fa_secret, $code);
    }

    /**
     * Verify backup code
     */
    public function verifyBackupCode(string $code): bool
    {
        if (!$this->backup_codes || !is_array($this->backup_codes)) {
            return false;
        }

        $index = array_search($code, $this->backup_codes);
        
        if ($index !== false) {
            // Remove used backup code
            $codes = $this->backup_codes;
            unset($codes[$index]);
            $this->backup_codes = array_values($codes);
            $this->save();
            
            return true;
        }

        return false;
    }

    /**
     * Generate backup codes for 2FA
     */
    protected function generateBackupCodes(int $count = 10): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(substr(bin2hex(random_bytes(5)), 0, 8));
        }
        return $codes;
    }

    /**
     * Get QR code URL for 2FA
     */
    public function getTwoFactorQrCodeUrl(): string
    {
        if (!$this->google2fa_secret) {
            return '';
        }

        $google2fa = new Google2FA();
        $companyName = config('app.name', 'WaterMIS');
        
        return $google2fa->getQRCodeUrl(
            $companyName,
            $this->email,
            $this->google2fa_secret
        );
    }

    /**
     * Switch tenant context
     */
    public function switchTenant(?string $tenantId): void
    {
        if ($tenantId && !$this->tenants()->where('tenants.id', $tenantId)->exists()) {
            throw new \Exception('User does not have access to this tenant');
        }

        $this->current_tenant_id = $tenantId;
        $this->save();
    }

    /**
     * Get sessions for this user
     */
    public function sessions()
    {
        return $this->hasMany(Session::class);
    }

    /**
     * Get API keys created by this user
     */
    public function apiKeys()
    {
        return $this->hasMany(ApiKey::class, 'created_by');
    }

    /**
     * Get trusted devices for this user
     */
    public function trustedDevices()
    {
        return $this->hasMany(DeviceTrust::class);
    }

    /**
     * Get audit events created by this user
     */
    public function auditEvents()
    {
        return $this->hasMany(AuditEvent::class, 'user_id');
    }

    /**
     * Get consents given by this user
     */
    public function consents()
    {
        return $this->hasMany(Consent::class, 'user_id');
    }

    /**
     * Get DSR requests created by this user
     */
    public function dsrRequests()
    {
        return $this->hasMany(DsrRequest::class, 'requester_id');
    }

    /**
     * Override guard name for Spatie Permission (multi-tenant)
     */
    public function getDefaultGuardName(): string
    {
        return 'web';
    }
}
