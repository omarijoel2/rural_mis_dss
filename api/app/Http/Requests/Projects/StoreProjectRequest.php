<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50|unique:projects,code,NULL,id,tenant_id,' . auth()->user()->tenant_id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:new_scheme,extension,rehabilitation,upgrade,emergency',
            'estimated_cost' => 'required|numeric|min:0',
            'budget_year' => 'required|integer|min:2000|max:2100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|array',
            'location.type' => 'required_with:location|in:Polygon',
            'location.coordinates' => 'required_with:location|array',
            'meta' => 'nullable|array',
        ];
    }
}
