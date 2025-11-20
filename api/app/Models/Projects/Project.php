<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Project extends Model
{
    use HasFactory, HasUuids, SoftDeletes, HasSpatial;

    protected $fillable = [
        'tenant_id',
        'code',
        'title',
        'description',
        'program_id',
        'category_id',
        'cost_center_id',
        'pipeline_id',
        'pm_id',
        'baseline_budget',
        'revised_budget',
        'budget_version_id',
        'baseline_start_date',
        'baseline_end_date',
        'revised_start_date',
        'revised_end_date',
        'actual_start_date',
        'actual_end_date',
        'physical_progress',
        'financial_progress',
        'status',
        'location',
        'created_by',
        'meta',
    ];

    protected $casts = [
        'location' => Polygon::class,
        'baseline_budget' => 'decimal:2',
        'revised_budget' => 'decimal:2',
        'physical_progress' => 'decimal:2',
        'financial_progress' => 'decimal:2',
        'baseline_start_date' => 'date',
        'baseline_end_date' => 'date',
        'revised_start_date' => 'date',
        'revised_end_date' => 'date',
        'actual_start_date' => 'date',
        'actual_end_date' => 'date',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('projects.tenant_id', auth()->user()->tenant_id);
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

    public function pipeline()
    {
        return $this->belongsTo(InvestmentPipeline::class, 'pipeline_id');
    }

    public function projectManager()
    {
        return $this->belongsTo(User::class, 'pm_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function milestones()
    {
        return $this->hasMany(ProjectMilestone::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function defects()
    {
        return $this->hasMany(ProjectDefect::class);
    }

    public function progressReports()
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function landParcels()
    {
        return $this->hasMany(LandParcel::class);
    }

    public function designModels()
    {
        return $this->hasMany(DesignModel::class);
    }

    public function handoverPackages()
    {
        return $this->hasMany(HandoverPackage::class);
    }

    public function capitalizationEntries()
    {
        return $this->hasMany(CapitalizationEntry::class);
    }

    public function budgetVersion()
    {
        return $this->belongsTo(\App\Models\Costing\BudgetVersion::class, 'budget_version_id');
    }

    public function costCenter()
    {
        return $this->belongsTo(\App\Models\Costing\CostCenter::class, 'cost_center_id');
    }

    public function actuals()
    {
        return $this->hasMany(\App\Models\Costing\Actual::class, 'project_id');
    }

    public function encumbrances()
    {
        return $this->hasMany(\App\Models\Costing\Encumbrance::class, 'project_id');
    }
}
