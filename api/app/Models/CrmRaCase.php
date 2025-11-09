<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class CrmRaCase extends Model
{
    use HasSpatial;

    protected $fillable = [
        'tenant_id',
        'account_no',
        'meter_id',
        'premise_id',
        'rule_code',
        'detected_at',
        'severity',
        'status',
        'score',
        'description',
        'evidence',
        'geom',
    ];

    protected $casts = [
        'detected_at' => 'datetime',
        'score' => 'decimal:2',
        'evidence' => 'array',
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
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'tenant_id');
    }

    public function meter(): BelongsTo
    {
        return $this->belongsTo(CrmMeter::class, 'meter_id');
    }

    public function premise(): BelongsTo
    {
        return $this->belongsTo(CrmPremise::class, 'premise_id');
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(CrmRaRule::class, 'rule_code', 'code');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(CrmRaAction::class, 'ra_case_id');
    }

    public function connection()
    {
        return $this->belongsTo(CrmServiceConnection::class, 'account_no', 'account_no');
    }
}
