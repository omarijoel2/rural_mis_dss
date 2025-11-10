<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class InvestmentCriterion extends Model
{
    use HasFactory;

    protected $table = 'investment_criteria';

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'dimension',
        'weight',
        'formula',
        'params',
        'active',
    ];

    protected $casts = [
        'params' => 'array',
        'active' => 'boolean',
        'weight' => 'integer',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('investment_criteria.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scores()
    {
        return $this->hasMany(PipelineScore::class, 'criterion_id');
    }
}
