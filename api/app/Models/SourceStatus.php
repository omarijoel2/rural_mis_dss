<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SourceStatus extends Model
{
    public $timestamps = false;
    
    protected $fillable = ['code', 'name', 'color', 'active', 'sort_order'];
    
    protected $casts = [
        'active' => 'boolean',
    ];
}
