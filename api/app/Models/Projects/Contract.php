<?php

namespace App\Models\Projects;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'project_id',
        'contract_no',
        'contractor_name',
        'contractor_contact',
        'type',
        'contract_sum',
        'revised_sum',
        'signing_date',
        'commencement_date',
        'completion_date',
        'extended_completion_date',
        'defects_liability_months',
        'status',
        'meta',
    ];

    protected $casts = [
        'contract_sum' => 'decimal:2',
        'revised_sum' => 'decimal:2',
        'signing_date' => 'date',
        'commencement_date' => 'date',
        'completion_date' => 'date',
        'extended_completion_date' => 'date',
        'defects_liability_months' => 'integer',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            if (auth()->check()) {
                $query->where('contracts.tenant_id', auth()->user()->tenant_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function changeOrders()
    {
        return $this->hasMany(ChangeOrder::class);
    }

    public function claims()
    {
        return $this->hasMany(ContractorClaim::class);
    }

    public function defects()
    {
        return $this->hasMany(ProjectDefect::class);
    }
}
