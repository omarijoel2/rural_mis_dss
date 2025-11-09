<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmPaymentPlan extends Model
{
    protected $fillable = [
        'account_no',
        'status',
        'schedule',
        'next_due',
    ];

    protected $casts = [
        'schedule' => 'array',
        'next_due' => 'date',
    ];

    public function connection(): BelongsTo
    {
        return $this->belongsTo(CrmServiceConnection::class, 'account_no', 'account_no');
    }
}
