<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDmaRequest extends FormRequest
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
            'scheme_id' => 'sometimes|uuid|exists:schemes,id',
            'code' => 'sometimes|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'sometimes|string|min:3|max:140',
            'status' => 'sometimes|in:active,inactive,planning',
            'geom' => 'sometimes|nullable|array',
            'nightline_threshold_m3h' => 'sometimes|nullable|numeric',
            'pressure_target_bar' => 'sometimes|nullable|numeric',
            'meta' => 'sometimes|nullable|array',
        ];
    }
}
