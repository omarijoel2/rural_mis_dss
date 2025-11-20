<?php

namespace App\Models;

use App\Models\Traits\HasTenancy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpatialChangeLog extends Model
{
    use HasFactory, HasUuids, HasTenancy;

    protected $table = 'spatial_change_log';

    protected $fillable = [
        'tenant_id',
        'entity_type',
        'entity_id',
        'action',
        'changes',
        'changed_by',
        'change_source',
        'redline_id',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function redline()
    {
        return $this->belongsTo(Redline::class);
    }
}
