<?php

namespace App\Models\Costing;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Actual extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'cost_center_id',
        'gl_account_id',
        'project_id',
        'scheme_id',
        'dma_id',
        'class',
        'period',
        'amount',
        'source',
        'ref',
        'meta',
    ];

    protected $casts = [
        'period' => 'date',
        'amount' => 'decimal:2',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('actuals.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class);
    }

    public function glAccount()
    {
        return $this->belongsTo(GlAccount::class);
    }
}
