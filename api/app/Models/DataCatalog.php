<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataCatalog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'entity_type',
        'table_name',
        'description',
        'data_class_id',
        'retention_policy_id',
        'contains_pii',
        'fields',
    ];

    protected $casts = [
        'contains_pii' => 'boolean',
        'fields' => 'array',
    ];

    public function dataClass()
    {
        return $this->belongsTo(DataClass::class);
    }

    public function retentionPolicy()
    {
        return $this->belongsTo(RetentionPolicy::class);
    }

    /**
     * Scope for PII-containing entities
     */
    public function scopeContainsPii($query)
    {
        return $query->where('contains_pii', true);
    }

    /**
     * Scope by entity type
     */
    public function scopeEntityType($query, string $type)
    {
        return $query->where('entity_type', $type);
    }

    /**
     * Get fields that contain PII
     */
    public function getPiiFields(): array
    {
        if (!$this->fields || !is_array($this->fields)) {
            return [];
        }

        return array_filter($this->fields, function ($field) {
            return isset($field['is_pii']) && $field['is_pii'] === true;
        });
    }
}
