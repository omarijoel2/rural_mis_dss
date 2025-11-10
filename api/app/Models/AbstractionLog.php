<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class AbstractionLog extends Model
{
    protected $fillable = [
        'source_id',
        'scheme_id',
        'logged_at',
        'volume_m3',
        'method',
        'quality',
        'logged_by',
        'meta',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
        'volume_m3' => 'decimal:2',
        'meta' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (!auth()->check()) {
                $query->whereRaw('1 = 0');
                return;
            }

            try {
                $tenantId = auth()->user()->currentTenantId();
                $query->whereHas('source', function (Builder $q) use ($tenantId) {
                    $q->where('tenant_id', $tenantId);
                });
            } catch (\RuntimeException $e) {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function logger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by');
    }
}
