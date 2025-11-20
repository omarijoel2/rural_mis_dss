<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasTenancy;

class Course extends Model
{
    use HasFactory, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'title',
        'code',
        'domain',
        'level',
        'format',
        'credits',
        'duration_min',
        'prerequisites',
        'expiry_days',
        'owner_id',
        'syllabus',
        'description',
        'thumbnail_url',
        'rating',
        'enrollments_count',
        'status',
    ];

    protected $casts = [
        'prerequisites' => 'array',
        'syllabus' => 'array',
        'rating' => 'decimal:2',
        'enrollments_count' => 'integer',
        'credits' => 'integer',
        'duration_min' => 'integer',
        'expiry_days' => 'integer',
    ];

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order_index');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByDomain($query, $domain)
    {
        return $query->where('domain', $domain);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }
}
