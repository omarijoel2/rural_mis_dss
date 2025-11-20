<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Permit extends Model
{
    protected $fillable = [
        'tenant_id',
        'permit_num',
        'work_order_id',
        'permit_type',
        'requested_by',
        'approved_by',
        'location',
        'hazards',
        'controls',
        'ppe_required',
        'tools_equipment',
        'isolation_required',
        'start_time',
        'end_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'hazards' => 'array',
        'controls' => 'array',
        'ppe_required' => 'array',
        'tools_equipment' => 'array',
        'isolation_required' => 'boolean',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
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

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(PermitApproval::class);
    }
}
