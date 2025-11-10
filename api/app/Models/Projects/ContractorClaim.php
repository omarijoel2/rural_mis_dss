<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ContractorClaim extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'contract_id',
        'claim_no',
        'description',
        'claimed_amount',
        'approved_amount',
        'type',
        'claim_date',
        'response_date',
        'status',
        'response_notes',
        'reviewed_by',
    ];

    protected $casts = [
        'claimed_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'claim_date' => 'date',
        'response_date' => 'date',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
