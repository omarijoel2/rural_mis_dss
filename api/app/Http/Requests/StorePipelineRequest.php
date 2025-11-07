<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePipelineRequest extends FormRequest
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
            'material' => 'required|in:PVC,HDPE,DI,GI,AC,steel,concrete',
            'diameter_mm' => 'required|integer|min:0',
            'install_year' => 'nullable|integer|min:1900|max:2100',
            'status' => 'required|in:active,inactive,abandoned',
            'geom' => 'nullable|array',
            'meta' => 'nullable|array',
        ];
    }
}
