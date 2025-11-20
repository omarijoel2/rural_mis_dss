<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenancy;

class EmployeeSkill extends Model
{
    use HasFactory, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'skill_id',
        'level_index',
        'evidence',
        'assessed_at',
        'assessor_id',
    ];

    protected $casts = [
        'level_index' => 'integer',
        'evidence' => 'array',
        'assessed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function skill()
    {
        return $this->belongsTo(Skill::class);
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }
}
