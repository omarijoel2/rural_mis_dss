<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ChangeOrder extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'contract_id',
        'vo_no',
        'description',
        'amount',
        'type',
        'time_extension_days',
        'justification',
        'status',
        'requested_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'time_extension_days' => 'integer',
        'approved_at' => 'datetime',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
