<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PipelineScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'pipeline_id',
        'criterion_id',
        'raw_score',
        'weighted_score',
        'rationale',
        'scored_by',
    ];

    protected $casts = [
        'raw_score' => 'decimal:2',
        'weighted_score' => 'decimal:2',
    ];

    public function pipeline()
    {
        return $this->belongsTo(InvestmentPipeline::class, 'pipeline_id');
    }

    public function criterion()
    {
        return $this->belongsTo(InvestmentCriterion::class, 'criterion_id');
    }

    public function scorer()
    {
        return $this->belongsTo(User::class, 'scored_by');
    }
}
