<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataClass extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'classification_level',
        'description',
        'requirements',
    ];

    protected $casts = [
        'requirements' => 'array',
    ];

    /**
     * Get catalog entries using this data class
     */
    public function catalogEntries()
    {
        return $this->hasMany(DataCatalog::class);
    }

    /**
     * Scope by classification level
     */
    public function scopeLevel($query, string $level)
    {
        return $query->where('classification_level', $level);
    }

    /**
     * Check if this is a high-security classification
     */
    public function isHighSecurity(): bool
    {
        return in_array($this->classification_level, ['confidential', 'restricted', 'secret']);
    }
}
