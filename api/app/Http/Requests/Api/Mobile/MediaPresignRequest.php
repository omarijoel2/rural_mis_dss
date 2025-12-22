<?php

namespace App\Http\Requests\Api\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class MediaPresignRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'filename' => 'required|string',
            'content_type' => 'required|string',
            'size_bytes' => 'nullable|integer',
        ];
    }
}
