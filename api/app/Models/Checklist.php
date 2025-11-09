<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Checklist extends Model
{
    protected $fillable = [
        'tenant_id',
        'title',
        'schema',
        'frequency',
    ];

    protected $casts = [
        'schema' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->where('tenant_id', auth()->user()->currentTenantId());
                } catch (\RuntimeException $e) {
                    // Tenant not selected - force empty results to prevent cross-tenant access
                    $query->whereRaw('1 = 0');
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(ChecklistRun::class);
    }
}
