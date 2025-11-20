<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PermitApproval extends Model
{
    protected $fillable = [
        'permit_id',
        'approver_role',
        'approver_id',
        'approved_at',
        'signature_path',
        'comments',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function permit(): BelongsTo
    {
        return $this->belongsTo(Permit::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
