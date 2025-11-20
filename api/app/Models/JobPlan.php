<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class JobPlan extends Model
{
    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'description',
        'asset_class_id',
        'version',
        'status',
        'sop',
        'checklist',
        'required_tools',
        'labor_roles',
        'required_parts',
        'risk_notes',
        'permit_type',
        'estimated_hours',
        'estimated_cost',
    ];

    protected $casts = [
        'checklist' => 'array',
        'required_tools' => 'array',
        'labor_roles' => 'array',
        'required_parts' => 'array',
        'estimated_hours' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
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

    public function assetClass(): BelongsTo
    {
        return $this->belongsTo(AssetClass::class);
    }

    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class);
    }
}
