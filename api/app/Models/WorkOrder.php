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
        'scheme_id',
        'dma_id',
        'title',
        'description',
        'priority',
        'status',
        'created_by',
        'assigned_to',
        'scheduled_for',
        'due_at',
        'started_at',
        'completed_at',
        'qa_at',
        'qa_by',
        'completion_notes',
        'pm_policy_id',
        'job_plan_id',
        'sla_policy_id',
        'est_labor_hours',
        'est_parts_cost',
        'actual_labor_hours',
        'actual_parts_cost',
        'actual_external_cost',
        'variance_notes',
        'geom',
        'source',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'due_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'qa_at' => 'datetime',
        'est_labor_hours' => 'decimal:2',
        'est_parts_cost' => 'decimal:2',
        'actual_labor_hours' => 'decimal:2',
        'actual_parts_cost' => 'decimal:2',
        'actual_external_cost' => 'decimal:2',
        'geom' => Point::class,
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

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function dma(): BelongsTo
    {
        return $this->belongsTo(Dma::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function qaBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'qa_by');
    }
    
    public function pmPolicy(): BelongsTo
    {
        return $this->belongsTo(PmPolicy::class);
    }

    public function jobPlan(): BelongsTo
    {
        return $this->belongsTo(JobPlan::class);
    }

    public function slaPolicy(): BelongsTo
    {
        return $this->belongsTo(SlaPolicy::class);
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

    public function attachments(): HasMany
    {
        return $this->hasMany(WoAttachment::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(WoChecklistItem::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(WoComment::class);
    }

    public function transitions(): HasMany
    {
        return $this->hasMany(WoTransition::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(WoAssignment::class);
    }

    public function permits(): HasMany
    {
        return $this->hasMany(Permit::class);
    }

    public function riskAssessments(): HasMany
    {
        return $this->hasMany(RiskAssessment::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    public function slaBreaches(): HasMany
    {
        return $this->hasMany(SlaBreach::class);
    }
}
