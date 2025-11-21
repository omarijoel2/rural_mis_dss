<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LpoItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'lpo_id',
        'description',
        'quantity',
        'unit',
        'unit_price',
        'total_price',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function lpo()
    {
        return $this->belongsTo(Lpo::class);
    }
}
