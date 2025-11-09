<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SourceKind extends Model
{
    public $timestamps = false;
    
    protected $fillable = ['code', 'name', 'description', 'active', 'sort_order'];
    
    protected $casts = [
        'active' => 'boolean',
    ];
}
