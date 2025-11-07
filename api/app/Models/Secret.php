<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Secret extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'key',
        'encrypted_value',
        'description',
        'rotated_at',
        'expires_at',
    ];

    protected $hidden = [
        'encrypted_value',
    ];

    protected $casts = [
        'rotated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Scope for secrets needing rotation
     */
    public function scopeNeedsRotation($query, int $daysThreshold = 90)
    {
        return $query->where(function ($q) use ($daysThreshold) {
            $q->whereNull('rotated_at')
              ->orWhere('rotated_at', '<', now()->subDays($daysThreshold));
        });
    }

    /**
     * Scope for expired secrets
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
                     ->where('expires_at', '<', now());
    }

    /**
     * Check if secret needs rotation
     */
    public function needsRotation(int $daysThreshold = 90): bool
    {
        if (!$this->rotated_at) {
            return true;
        }

        return $this->rotated_at->diffInDays(now()) >= $daysThreshold;
    }

    /**
     * Mark secret as rotated
     */
    public function markRotated(): void
    {
        $this->rotated_at = now();
        $this->save();
    }

    /**
     * Check if secret is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
