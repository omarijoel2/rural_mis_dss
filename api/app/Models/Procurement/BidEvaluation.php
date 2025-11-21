<?php

namespace App\Models\Procurement;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BidEvaluation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'bid_id',
        'evaluator_id',
        'price_score',
        'quality_score',
        'delivery_score',
        'experience_score',
        'total_score',
        'comments',
    ];

    protected $casts = [
        'price_score' => 'decimal:2',
        'quality_score' => 'decimal:2',
        'delivery_score' => 'decimal:2',
        'experience_score' => 'decimal:2',
        'total_score' => 'decimal:2',
    ];

    public function bid()
    {
        return $this->belongsTo(Bid::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}
