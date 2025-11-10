<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StationType extends Model
{
    public $timestamps = false;
    
    protected $fillable = ['code', 'name', 'description', 'active', 'sort_order'];
    
    protected $casts = [
        'active' => 'boolean',
    ];

    public function stations(): HasMany
    {
        return $this->hasMany(HydrometStation::class, 'station_type_id');
    }
}
