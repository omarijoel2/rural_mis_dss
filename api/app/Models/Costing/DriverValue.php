<?php

namespace App\Models\Costing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'period',
        'value',
        'scope',
        'scope_id',
        'meta',
    ];

    protected $casts = [
        'period' => 'date',
        'value' => 'decimal:4',
        'meta' => 'array',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
