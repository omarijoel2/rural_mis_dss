<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Event extends Model
{
    use HasSpatial;

    protected $fillable = [
        'tenant_id',
        'source',
        'external_id',
        'facility_id',
        'scheme_id',
        'dma_id',
        'category',
        'subcategory',
        'severity',
        'detected_at',
        'acknowledged_at',
        'resolved_at',
        'status',
        'description',
        'attributes',
        'location',
        'correlation_key',
        'sla_due_at',
    ];

    protected $casts = [
        'detected_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'sla_due_at' => 'datetime',
        'attributes' => 'array',
        'location' => Point::class,
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

    public function links(): HasMany
    {
        return $this->hasMany(EventLink::class);
    }

    public function actions(): HasMany
    {
        return $this->hasMany(EventAction::class)->orderBy('occurred_at');
    }
}
