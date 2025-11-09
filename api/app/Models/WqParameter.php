<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WqParameter extends Model
{
    protected $fillable = [
        'code',
        'name',
        'group',
        'unit',
        'method',
        'lod',
        'loi',
        'who_limit',
        'wasreb_limit',
        'local_limit',
        'advisory',
        'is_active',
    ];

    protected $casts = [
        'lod' => 'float',
        'loi' => 'float',
        'who_limit' => 'float',
        'wasreb_limit' => 'float',
        'local_limit' => 'float',
        'is_active' => 'boolean',
    ];

    public function sampleParams(): HasMany
    {
        return $this->hasMany(WqSampleParam::class, 'parameter_id');
    }

    public function qcControls(): HasMany
    {
        return $this->hasMany(WqQcControl::class, 'parameter_id');
    }

    public function compliance(): HasMany
    {
        return $this->hasMany(WqCompliance::class, 'parameter_id');
    }
}
