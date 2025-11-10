<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModelCalibration extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_id',
        'calibration_name',
        'calibration_date',
        'field_measurements',
        'model_outputs',
        'rmse',
        'correlation',
        'notes',
        'calibrated_by',
    ];

    protected $casts = [
        'calibration_date' => 'date',
        'field_measurements' => 'array',
        'model_outputs' => 'array',
        'rmse' => 'decimal:4',
        'correlation' => 'decimal:4',
    ];

    public function model()
    {
        return $this->belongsTo(DesignModel::class, 'model_id');
    }

    public function calibrator()
    {
        return $this->belongsTo(User::class, 'calibrated_by');
    }
}
