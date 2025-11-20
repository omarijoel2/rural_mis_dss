<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenancy;

class Skill extends Model
{
    use HasFactory, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'description',
        'levels',
        'category',
    ];

    protected $casts = [
        'levels' => 'array',
    ];

    public function employeeSkills()
    {
        return $this->hasMany(EmployeeSkill::class);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
