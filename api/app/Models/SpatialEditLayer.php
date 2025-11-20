<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SpatialEditLayer extends Model
{
    use HasFactory, HasUuids, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'name',
        'layer_type',
        'description',
        'status',
        'created_by',
        'reviewed_by',
        'approved_by',
        'submitted_at',
        'reviewed_at',
        'approved_at',
        'review_notes',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function redlines()
    {
        return $this->hasMany(Redline::class, 'edit_layer_id');
    }

    public function topologyValidations()
    {
        return $this->hasMany(TopologyValidation::class, 'edit_layer_id');
    }
}
