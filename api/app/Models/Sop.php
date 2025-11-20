<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasTenancy;

class Sop extends Model
{
    use HasFactory, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'code',
        'title',
        'category',
        'metadata',
        'content',
        'version',
        'status',
        'reviewed_at',
        'published_at',
        'next_review_due',
        'approver_id',
        'attestations',
    ];

    protected $casts = [
        'metadata' => 'array',
        'content' => 'array',
        'version' => 'integer',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
        'next_review_due' => 'datetime',
        'attestations' => 'array',
    ];

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeDueForReview($query)
    {
        return $query->whereNotNull('next_review_due')
                     ->where('next_review_due', '<=', now());
    }

    public function addAttestation($userId)
    {
        $attestations = $this->attestations ?? [];
        $attestations[] = [
            'user_id' => $userId,
            'read_at' => now()->toISOString(),
        ];
        $this->update(['attestations' => $attestations]);
    }
}
