<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DsrRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'requester_id',
        'request_type',
        'status',
        'subject_email',
        'subject_name',
        'details',
        'submitted_at',
        'completed_at',
        'fulfilled_by',
        'fulfillment_notes',
    ];

    protected $casts = [
        'details' => 'array',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function fulfilledBy()
    {
        return $this->belongsTo(User::class, 'fulfilled_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for in-progress requests
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope for completed requests
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope by request type
     */
    public function scopeType($query, string $type)
    {
        return $query->where('request_type', $type);
    }

    /**
     * Mark as in progress
     */
    public function markInProgress(): void
    {
        $this->status = 'in_progress';
        $this->save();
    }

    /**
     * Mark as completed
     */
    public function markCompleted(User $user, ?string $notes = null): void
    {
        $this->status = 'completed';
        $this->completed_at = now();
        $this->fulfilled_by = $user->id;
        if ($notes) {
            $this->fulfillment_notes = $notes;
        }
        $this->save();
    }

    /**
     * Reject the request
     */
    public function reject(User $user, string $reason): void
    {
        $this->status = 'rejected';
        $this->completed_at = now();
        $this->fulfilled_by = $user->id;
        $this->fulfillment_notes = $reason;
        $this->save();
    }
}
