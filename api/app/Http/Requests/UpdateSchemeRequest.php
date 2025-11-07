<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSchemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'org_id' => 'sometimes|nullable|uuid|exists:organizations,id',
            'code' => 'sometimes|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'sometimes|string|min:3|max:140',
            'type' => 'sometimes|in:urban,rural,mixed',
            'population_estimate' => 'sometimes|nullable|integer|min:0',
            'status' => 'sometimes|in:active,planning,decommissioned',
            'geom' => 'sometimes|nullable|array',
            'centroid' => 'sometimes|nullable|array',
            'elevation_m' => 'sometimes|nullable|numeric',
            'meta' => 'sometimes|nullable|array',
        ];
    }
}
