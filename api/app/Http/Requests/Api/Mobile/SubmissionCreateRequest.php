<?php

namespace App\Http\Requests\Api\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class SubmissionCreateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'form_id' => 'required|string',
            'form_version' => 'nullable|string',
            'data' => 'required|array',
            'device_id' => 'required|string',
            'media_keys' => 'nullable|array',
            'media_keys.*' => 'string',
            'metadata' => 'nullable|array',
        ];
    }
}
