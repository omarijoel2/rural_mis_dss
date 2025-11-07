<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetentionPolicy extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'applies_to',
        'retention_days',
        'action_on_expiry',
        'is_active',
    ];

    protected $casts = [
        'applies_to' => 'array',
        'retention_days' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Scope for active policies
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if policy applies to a given entity type
     */
    public function appliesTo(string $entityType): bool
    {
        return in_array($entityType, $this->applies_to ?? []);
    }

    /**
     * Calculate expiry date for a record
     */
    public function calculateExpiryDate(\DateTime $createdAt): \DateTime
    {
        return (clone $createdAt)->modify("+{$this->retention_days} days");
    }
}
