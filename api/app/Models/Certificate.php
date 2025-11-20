<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTenancy;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'course_id',
        'code',
        'qr_token',
        'score',
        'issued_at',
        'expires_at',
        'metadata',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($certificate) {
            if (!$certificate->code) {
                $certificate->code = 'CERT-' . strtoupper(Str::random(10));
            }
            if (!$certificate->qr_token) {
                $certificate->qr_token = Str::random(32);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
                     ->where('expires_at', '<=', now());
    }
}
