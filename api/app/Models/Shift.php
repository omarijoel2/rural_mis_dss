<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Shift extends Model
{
    protected $fillable = [
        'tenant_id',
        'facility_id',
        'scheme_id',
        'dma_id',
        'name',
        'starts_at',
        'ends_at',
        'supervisor_id',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
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

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function dma(): BelongsTo
    {
        return $this->belongsTo(Dma::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(ShiftEntry::class);
    }

    public function checklistRuns(): HasMany
    {
        return $this->hasMany(ChecklistRun::class);
    }
}
