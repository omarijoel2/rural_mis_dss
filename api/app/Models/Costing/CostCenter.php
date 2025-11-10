<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class CostCenter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'parent_id',
        'owner_id',
        'active',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('cost_centers.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function parent()
    {
        return $this->belongsTo(CostCenter::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(CostCenter::class, 'parent_id');
    }

    public function budgetLines()
    {
        return $this->hasMany(BudgetLine::class);
    }

    public function forecastLines()
    {
        return $this->hasMany(ForecastLine::class);
    }

    public function actuals()
    {
        return $this->hasMany(Actual::class);
    }

    public function encumbrances()
    {
        return $this->hasMany(Encumbrance::class);
    }

    public function allocResults()
    {
        return $this->hasMany(AllocResult::class);
    }
}
