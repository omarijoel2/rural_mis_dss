<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmTicket extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'crm_tickets';

    protected $fillable = [
        'tenant_id',
        'ticket_no',
        'customer_id',
        'category_id',
        'channel',
        'subject',
        'description',
        'priority',
        'status',
        'assigned_to',
        'sla_response_due',
        'sla_resolution_due',
        'responded_at',
        'resolved_at',
        'closed_at',
        'csat_score',
    ];

    protected $casts = [
        'sla_response_due' => 'datetime',
        'sla_resolution_due' => 'datetime',
        'responded_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'csat_score' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function threads(): HasMany
    {
        return $this->hasMany(TicketThread::class, 'ticket_id');
    }
}
