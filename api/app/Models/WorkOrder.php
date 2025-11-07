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
        'asset_id',
        'title',
        'type',
        'priority',
        'status',
        'requester_id',
        'assignee_id',
        'opened_at',
        'due_at',
        'closed_at',
        'location',
        'description',
        'checklist',
        'costs',
        'source',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'due_at' => 'datetime',
        'closed_at' => 'datetime',
        'checklist' => 'array',
        'costs' => 'decimal:2',
        'location' => Point::class,
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

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(WoPart::class);
    }

    public function labor(): HasMany
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
