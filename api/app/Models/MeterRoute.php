<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeterRoute extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'meter_routes';

    protected $fillable = [
        'tenant_id',
        'scheme_id',
        'dma_id',
        'route_code',
        'name',
        'meters_count',
        'assigned_to',
        'status',
        'read_day',
    ];

    protected $casts = [
        'meters_count' => 'integer',
        'read_day' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(Scheme::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function cycles(): HasMany
    {
        return $this->hasMany(MeterReadingCycle::class, 'route_id');
    }
}
