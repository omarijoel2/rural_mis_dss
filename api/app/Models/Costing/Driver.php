<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'formula',
        'unit',
        'source',
        'params',
        'description',
    ];

    protected $casts = [
        'params' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('drivers.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function values()
    {
        return $this->hasMany(DriverValue::class);
    }

    public function allocationRules()
    {
        return $this->hasMany(AllocationRule::class);
    }
}
