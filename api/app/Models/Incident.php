<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Incident extends Model
{
    protected $fillable = [
        'tenant_id',
        'incident_num',
        'work_order_id',
        'incident_type',
        'severity',
        'occurred_at',
        'location',
        'description',
        'injured_person',
        'first_aid',
        'medical_treatment',
        'lost_time',
        'reported_by',
        'investigated_by',
        'root_cause',
        'corrective_actions',
        'status',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'first_aid' => 'boolean',
        'medical_treatment' => 'boolean',
        'lost_time' => 'boolean',
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

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function investigatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investigated_by');
    }

    public function capas(): HasMany
    {
        return $this->hasMany(Capa::class);
    }
}
