<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RequisitionItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'requisition_id',
        'description',
        'quantity',
        'unit',
        'unit_cost_estimate',
        'total_estimate',
        'budget_line_id',
        'specifications',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost_estimate' => 'decimal:2',
        'total_estimate' => 'decimal:2',
        'specifications' => 'array',
    ];

    public function requisition()
    {
        return $this->belongsTo(Requisition::class);
    }
}
