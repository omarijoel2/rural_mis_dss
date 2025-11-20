<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasTenancy;

class KbArticle extends Model
{
    use HasFactory, SoftDeletes, HasTenancy;

    protected $fillable = [
        'tenant_id',
        'title',
        'category',
        'tags',
        'content',
        'attachments',
        'version',
        'status',
        'author_id',
        'reviewers',
        'approver_id',
        'reviewed_at',
        'published_at',
        'views_count',
        'helpful_count',
        'not_helpful_count',
    ];

    protected $casts = [
        'tags' => 'array',
        'attachments' => 'array',
        'reviewers' => 'array',
        'version' => 'integer',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
        'views_count' => 'integer',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function markHelpful()
    {
        $this->increment('helpful_count');
    }

    public function markNotHelpful()
    {
        $this->increment('not_helpful_count');
    }
}
