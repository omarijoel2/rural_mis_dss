<?php

namespace App\Models\Costing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'version_id',
        'cost_center_id',
        'gl_account_id',
        'project_id',
        'scheme_id',
        'dma_id',
        'class',
        'period',
        'amount',
        'meta',
    ];

    protected $casts = [
        'period' => 'date',
        'amount' => 'decimal:2',
        'meta' => 'array',
    ];

    public function version()
    {
        return $this->belongsTo(BudgetVersion::class, 'version_id');
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
