<?php

namespace App\Models\Costing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForecastLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'forecast_id',
        'cost_center_id',
        'gl_account_id',
        'scheme_id',
        'dma_id',
        'class',
        'period',
        'amount',
        'method_meta',
    ];

    protected $casts = [
        'period' => 'date',
        'amount' => 'decimal:2',
        'method_meta' => 'array',
    ];

    public function forecast()
    {
        return $this->belongsTo(Forecast::class);
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
