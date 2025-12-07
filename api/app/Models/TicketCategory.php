<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ticket_categories';

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'priority',
        'sla_response_hours',
        'sla_resolution_hours',
    ];

    protected $casts = [
        'sla_response_hours' => 'integer',
        'sla_resolution_hours' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(CrmTicket::class, 'category_id');
    }
}
