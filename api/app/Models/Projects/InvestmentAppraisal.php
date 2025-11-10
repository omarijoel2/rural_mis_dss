<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvestmentAppraisal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'pipeline_id',
        'appraisal_no',
        'appraiser_id',
        'appraisal_date',
        'executive_summary',
        'capex',
        'opex_annual',
        'project_life_years',
        'discount_rate',
        'calculated_npv',
        'calculated_bcr',
        'calculated_irr',
        'risks',
        'assumptions',
        'recommendation',
        'recommendation_notes',
        'approved_by',
        'approved_at',
        'cash_flows',
        'meta',
    ];

    protected $casts = [
        'appraisal_date' => 'date',
        'capex' => 'decimal:2',
        'opex_annual' => 'decimal:2',
        'project_life_years' => 'integer',
        'discount_rate' => 'decimal:4',
        'calculated_npv' => 'decimal:2',
        'calculated_bcr' => 'decimal:4',
        'calculated_irr' => 'decimal:4',
        'cash_flows' => 'array',
        'meta' => 'array',
        'approved_at' => 'datetime',
    ];

    public function pipeline()
    {
        return $this->belongsTo(InvestmentPipeline::class, 'pipeline_id');
    }

    public function appraiser()
    {
        return $this->belongsTo(User::class, 'appraiser_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
