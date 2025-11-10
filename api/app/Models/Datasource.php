<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Datasource extends Model
{
    public $timestamps = false;
    
    protected $fillable = ['code', 'name', 'sort_order'];

    public function stations(): HasMany
    {
        return $this->hasMany(HydrometStation::class, 'datasource_id');
    }
}
