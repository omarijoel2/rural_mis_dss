<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class AllocRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'version_id',
        'forecast_id',
        'period_from',
        'period_to',
        'status',
        'meta',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'period_from' => 'date',
        'period_to' => 'date',
        'meta' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('alloc_runs.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function version()
    {
        return $this->belongsTo(BudgetVersion::class, 'version_id');
    }

    public function forecast()
    {
        return $this->belongsTo(Forecast::class, 'forecast_id');
    }

    public function results()
    {
        return $this->hasMany(AllocResult::class, 'run_id');
    }
}
