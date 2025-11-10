<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;

class PortfolioScenario extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'budget_constraint',
        'optimization_method',
        'selected_pipelines',
        'total_cost',
        'total_npv',
        'created_by',
    ];

    protected $casts = [
        'budget_constraint' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'total_npv' => 'decimal:2',
        'selected_pipelines' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('portfolio_scenarios.tenant_id', auth()->user()->tenant_id);
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
}
