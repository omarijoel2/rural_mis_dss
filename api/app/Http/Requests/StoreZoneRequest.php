<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'type' => 'required|in:pressure,supply,district,administrative',
            'code' => 'required|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'required|string|min:3|max:140',
            'geom' => 'nullable|array',
            'meta' => 'nullable|array',
        ];
    }
}
