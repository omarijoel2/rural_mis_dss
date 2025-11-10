<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class GlAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'type',
        'parent_id',
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
                $query->where('gl_accounts.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function parent()
    {
        return $this->belongsTo(GlAccount::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(GlAccount::class, 'parent_id');
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

    public function allocResults()
    {
        return $this->hasMany(AllocResult::class);
    }
}
