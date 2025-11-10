<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModelRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_id',
        'scenario_name',
        'description',
        'parameters',
        'results',
        'status',
        'error_message',
        'started_at',
        'completed_at',
        'executed_by',
    ];

    protected $casts = [
        'parameters' => 'array',
        'results' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function model()
    {
        return $this->belongsTo(DesignModel::class, 'model_id');
    }

    public function executor()
    {
        return $this->belongsTo(User::class, 'executed_by');
    }
}
