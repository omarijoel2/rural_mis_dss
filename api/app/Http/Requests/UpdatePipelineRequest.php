<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePipelineRequest extends FormRequest
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
            'material' => 'sometimes|in:PVC,HDPE,DI,GI,AC,steel,concrete',
            'diameter_mm' => 'sometimes|integer|min:0',
            'install_year' => 'sometimes|nullable|integer|min:1900|max:2100',
            'status' => 'sometimes|in:active,inactive,abandoned',
            'geom' => 'sometimes|nullable|array',
            'meta' => 'sometimes|nullable|array',
        ];
    }
}
