<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class StorePipelineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:new_scheme,extension,rehabilitation,upgrade,emergency',
            'priority' => 'required|in:high,medium,low',
            'estimated_cost' => 'required|numeric|min:0',
            'estimated_benefits' => 'nullable|numeric|min:0',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'project_life_years' => 'nullable|integer|min:1|max:100',
            'location' => 'nullable|array',
            'location.coordinates' => 'required_with:location|array',
            'location.coordinates.0' => 'required_with:location|numeric|min:-180|max:180',
            'location.coordinates.1' => 'required_with:location|numeric|min:-90|max:90',
            'beneficiaries' => 'nullable|integer|min:0',
            'meta' => 'nullable|array',
        ];
    }
}
