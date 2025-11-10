<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Forecast extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'method',
        'horizon_months',
        'base_version_id',
        'created_by',
    ];

    protected $casts = [
        'horizon_months' => 'integer',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('forecasts.tenant_id', auth()->user()->tenant_id);
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

    public function baseVersion()
    {
        return $this->belongsTo(BudgetVersion::class, 'base_version_id');
    }

    public function lines()
    {
        return $this->hasMany(ForecastLine::class);
    }

    public function allocRuns()
    {
        return $this->hasMany(AllocRun::class);
    }
}
