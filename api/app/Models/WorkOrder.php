<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class WorkOrder extends Model
{
    use HasSpatial;

    protected $fillable = [
        'tenant_id',
        'wo_num',
        'kind',
        'asset_id',
        'title',
        'description',
        'priority',
        'status',
        'created_by',
        'assigned_to',
        'scheduled_for',
        'started_at',
        'completed_at',
        'completion_notes',
        'pm_policy_id',
        'geom',
        'source',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
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

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
    
    public function pmPolicy(): BelongsTo
    {
        return $this->belongsTo(PmPolicy::class);
    }

    public function woParts(): HasMany
    {
        return $this->hasMany(WoPart::class);
    }

    public function woLabor(): HasMany
    {
        return $this->hasMany(WoLabor::class);
    }
    
    public function failures(): HasMany
    {
        return $this->hasMany(Failure::class);
    }

    public function stockTxns(): HasMany
    {
        return $this->hasMany(StockTxn::class);
    }
}
