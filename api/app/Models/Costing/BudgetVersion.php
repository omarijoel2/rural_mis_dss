<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class BudgetVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'fiscal_year',
        'status',
        'is_rolling',
        'base_version_id',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'is_rolling' => 'boolean',
        'approved_at' => 'datetime',
        'fiscal_year' => 'integer',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('budget_versions.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function baseVersion()
    {
        return $this->belongsTo(BudgetVersion::class, 'base_version_id');
    }

    public function revisions()
    {
        return $this->hasMany(BudgetVersion::class, 'base_version_id');
    }

    public function lines()
    {
        return $this->hasMany(BudgetLine::class, 'version_id');
    }

    public function allocRuns()
    {
        return $this->hasMany(AllocRun::class, 'version_id');
    }

    public function forecasts()
    {
        return $this->hasMany(Forecast::class, 'base_version_id');
    }
}
