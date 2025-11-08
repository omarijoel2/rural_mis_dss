<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Asset extends Model
{
    use HasSpatial;

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'dma_id',
        'class_id',
        'parent_id',
        'code',
        'name',
        'barcode',
        'serial',
        'manufacturer',
        'model',
        'status',
        'install_date',
        'warranty_expiry',
        'geom',
        'specs',
    ];

    protected $casts = [
        'specs' => 'array',
        'install_date' => 'date',
        'warranty_expiry' => 'date',
        'geom' => Point::class,
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check() && auth()->user()->tenant_id) {
                $query->where('tenant_id', auth()->user()->tenant_id);
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

    public function assetClass(): BelongsTo
    {
        return $this->belongsTo(AssetClass::class, 'class_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Asset::class, 'parent_id');
    }

    public function locationHistory(): HasMany
    {
        return $this->hasMany(AssetLocation::class);
    }

    public function meters(): HasMany
    {
        return $this->hasMany(AssetMeter::class);
    }

    public function bom(): HasMany
    {
        return $this->hasMany(AssetBom::class);
    }

    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class);
    }

    public function pmPolicies(): HasMany
    {
        return $this->hasMany(PmPolicy::class, 'asset_id');
    }
}
