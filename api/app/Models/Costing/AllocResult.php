<?php

namespace App\Models\Costing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AllocResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'run_id',
        'gl_account_id',
        'cost_center_id',
        'scheme_id',
        'dma_id',
        'class',
        'period',
        'amount',
        'driver_value',
        'notes',
    ];

    protected $casts = [
        'period' => 'date',
        'amount' => 'decimal:2',
        'driver_value' => 'decimal:4',
    ];

    public function run()
    {
        return $this->belongsTo(AllocRun::class, 'run_id');
    }

    public function glAccount()
    {
        return $this->belongsTo(GlAccount::class);
    }

    public function costCenter()
    {
        return $this->belongsTo(CostCenter::class);
    }
}
