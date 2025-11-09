<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QualityRiskLevel extends Model
{
    public $timestamps = false;
    
    protected $fillable = ['code', 'name', 'color', 'sort_order'];
}
