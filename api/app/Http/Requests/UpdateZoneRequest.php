<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'sometimes|uuid|exists:schemes,id',
            'type' => 'sometimes|in:pressure,supply,district,administrative',
            'code' => 'sometimes|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'sometimes|string|min:3|max:140',
            'geom' => 'sometimes|nullable|array',
            'meta' => 'sometimes|nullable|array',
        ];
    }
}
