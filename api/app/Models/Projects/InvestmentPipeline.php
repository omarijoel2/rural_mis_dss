<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class InvestmentPipeline extends Model
{
    use HasFactory, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'code',
        'title',
        'description',
        'program_id',
        'category_id',
        'estimated_cost',
        'currency',
        'connections_added',
        'energy_savings',
        'nrw_reduction',
        'revenue_increase',
        'bcr',
        'npv',
        'irr',
        'risk_reduction_score',
        'priority_score',
        'status',
        'location',
        'created_by',
        'approved_by',
        'approved_at',
        'meta',
    ];

    protected $casts = [
        'location' => Polygon::class,
        'estimated_cost' => 'decimal:2',
        'energy_savings' => 'decimal:2',
        'nrw_reduction' => 'decimal:2',
        'revenue_increase' => 'decimal:2',
        'bcr' => 'decimal:4',
        'npv' => 'decimal:2',
        'irr' => 'decimal:4',
        'risk_reduction_score' => 'decimal:2',
        'priority_score' => 'decimal:2',
        'connections_added' => 'integer',
        'meta' => 'array',
        'approved_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('investment_pipelines.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function category()
    {
        return $this->belongsTo(ProjectCategory::class, 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scores()
    {
        return $this->hasMany(PipelineScore::class, 'pipeline_id');
    }

    public function appraisals()
    {
        return $this->hasMany(InvestmentAppraisal::class, 'pipeline_id');
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'pipeline_id');
    }
}
