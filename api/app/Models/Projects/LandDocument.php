<?php

namespace App\Models\Projects;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'parcel_id',
        'doc_type',
        'file_name',
        'file_path',
        'file_size',
        'document_date',
        'notes',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'document_date' => 'date',
    ];

    public function parcel()
    {
        return $this->belongsTo(LandParcel::class, 'parcel_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
