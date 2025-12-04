<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditEvent extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'tenant_id',
        'actor_id',
        'actor_type',
        'action',
        'entity_type',
        'entity_id',
        'ip',
        'ua',
        'diff',
        'occurred_at',
    ];

    protected $casts = [
        'diff' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function actor()
    {
        return $this->morphTo();
    }

    public function scopeForEntity($query, string $entityType, string $entityId)
    {
        return $query->where('entity_type', $entityType)
                     ->where('entity_id', $entityId);
    }

    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }
}
