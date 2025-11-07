<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceTrust extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'device_trust';

    protected $fillable = [
        'user_id',
        'device_fingerprint',
        'device_name',
        'device_type',
        'trusted_at',
        'expires_at',
        'last_seen_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'trusted_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if device trust is still valid
     */
    public function isValid(): bool
    {
        return $this->trusted_at 
            && (!$this->expires_at || $this->expires_at->isFuture());
    }

    /**
     * Update last seen timestamp
     */
    public function recordActivity(): void
    {
        $this->last_seen_at = now();
        $this->save();
    }

    /**
     * Revoke device trust
     */
    public function revoke(): void
    {
        $this->delete();
    }
}
