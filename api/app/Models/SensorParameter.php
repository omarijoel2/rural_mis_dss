<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SensorParameter extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'code',
        'name',
        'unit',
        'description',
        'min_value',
        'max_value',
        'active',
        'sort_order',
    ];
    
    protected $casts = [
        'min_value' => 'decimal:4',
        'max_value' => 'decimal:4',
        'active' => 'boolean',
    ];

    public function sensors(): HasMany
    {
        return $this->hasMany(HydrometSensor::class, 'parameter_id');
    }
}
