<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'org_id' => 'nullable|uuid|exists:organizations,id',
            'code' => 'required|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'required|string|min:3|max:140',
            'type' => 'required|in:urban,rural,mixed',
            'population_estimate' => 'nullable|integer|min:0',
            'status' => 'required|in:active,planning,decommissioned',
            'geom' => 'nullable|array',
            'centroid' => 'nullable|array',
            'elevation_m' => 'nullable|numeric',
            'meta' => 'nullable|array',
        ];
    }
}
