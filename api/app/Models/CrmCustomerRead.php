<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class CrmCustomerRead extends Model
{
    use HasSpatial;

    protected $fillable = [
        'meter_id',
        'read_at',
        'value',
        'photo_path',
        'read_source',
        'quality',
        'reader_id',
        'geom',
        'meta',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'value' => 'decimal:2',
        'geom' => Point::class,
        'meta' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                try {
                    $query->whereHas('meter.connection.premise', function ($q) {
                        $q->where('tenant_id', auth()->user()->currentTenantId());
                    });
                } catch (\RuntimeException $e) {
                    $query->whereRaw('1 = 0');
                }
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function meter(): BelongsTo
    {
        return $this->belongsTo(CrmMeter::class, 'meter_id');
    }

    public function reader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reader_id');
    }
}
