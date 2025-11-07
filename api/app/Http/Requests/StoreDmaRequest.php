<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDmaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'code' => 'required|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'required|string|min:3|max:140',
            'status' => 'required|in:active,inactive,planning',
            'geom' => 'nullable|array',
            'nightline_threshold_m3h' => 'nullable|numeric',
            'pressure_target_bar' => 'nullable|numeric',
            'meta' => 'nullable|array',
        ];
    }
}
