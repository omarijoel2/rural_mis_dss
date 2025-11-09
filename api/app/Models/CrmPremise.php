<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class CrmPremise extends Model
{
    use HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'dma_id',
        'code',
        'address',
        'category',
        'geom',
        'meta',
    ];

    protected $casts = [
        'geom' => Point::class,
        'meta' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->where('tenant_id', auth()->user()->currentTenantId());
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function dma(): BelongsTo
    {
        return $this->belongsTo(Dma::class);
    }

    public function serviceConnections(): HasMany
    {
        return $this->hasMany(CrmServiceConnection::class, 'premise_id');
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(CrmComplaint::class, 'premise_id');
    }

    public function raCases(): HasMany
    {
        return $this->hasMany(CrmRaCase::class, 'premise_id');
    }
}
