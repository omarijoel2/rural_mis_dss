<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'purpose',
        'data_types',
        'granted_at',
        'revoked_at',
        'expires_at',
        'consent_text',
        'version',
    ];

    protected $casts = [
        'data_types' => 'array',
        'granted_at' => 'datetime',
        'revoked_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if consent is active
     */
    public function isActive(): bool
    {
        return $this->granted_at 
            && !$this->revoked_at 
            && (!$this->expires_at || $this->expires_at->isFuture());
    }

    /**
     * Revoke consent
     */
    public function revoke(): void
    {
        $this->revoked_at = now();
        $this->save();
    }

    /**
     * Scope for active consents
     */
    public function scopeActive($query)
    {
        return $query->whereNotNull('granted_at')
                     ->whereNull('revoked_at')
                     ->where(function ($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }

    /**
     * Scope by purpose
     */
    public function scopePurpose($query, string $purpose)
    {
        return $query->where('purpose', $purpose);
    }
}
