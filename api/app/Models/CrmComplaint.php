<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class CrmComplaint extends Model
{
    use HasSpatial;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'account_no',
        'category',
        'priority',
        'status',
        'resolved_at',
        'resolution',
        'attachments',
        'geom',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'attachments' => 'array',
        'geom' => Point::class,
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CrmCustomer::class, 'customer_id');
    }

    public function premise(): BelongsTo
    {
        return $this->belongsTo(CrmPremise::class, 'premise_id');
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(CrmServiceConnection::class, 'account_no', 'account_no');
    }
}
