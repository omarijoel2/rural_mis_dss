<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KmsKey extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'key_id',
        'key_type',
        'algorithm',
        'purpose',
        'encrypted_key',
        'is_active',
        'rotated_at',
        'expires_at',
    ];

    protected $hidden = [
        'encrypted_key',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'rotated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Scope for active keys
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by purpose
     */
    public function scopePurpose($query, string $purpose)
    {
        return $query->where('purpose', $purpose);
    }

    /**
     * Check if key needs rotation
     */
    public function needsRotation(int $daysThreshold = 90): bool
    {
        if (!$this->rotated_at) {
            return true;
        }

        return $this->rotated_at->diffInDays(now()) >= $daysThreshold;
    }

    /**
     * Mark key as rotated
     */
    public function markRotated(): void
    {
        $this->rotated_at = now();
        $this->save();
    }

    /**
     * Deactivate key
     */
    public function deactivate(): void
    {
        $this->is_active = false;
        $this->save();
    }
}
