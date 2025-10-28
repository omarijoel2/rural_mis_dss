<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'short_code',
        'country',
        'timezone',
        'currency',
        'logo_path',
        'status',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function organizations()
    {
        return $this->hasMany(Organization::class);
    }

    public function schemes()
    {
        return $this->hasMany(Scheme::class);
    }

    public function facilities()
    {
        return $this->hasMany(Facility::class);
    }

    public function dmas()
    {
        return $this->hasMany(Dma::class);
    }

    public function pipelines()
    {
        return $this->hasMany(Pipeline::class);
    }

    public function zones()
    {
        return $this->hasMany(Zone::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
}
