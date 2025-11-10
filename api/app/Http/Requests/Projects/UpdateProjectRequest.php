<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $projectId = $this->route('project');
        
        return [
            'code' => 'sometimes|string|max:50|unique:projects,code,' . $projectId . ',id,tenant_id,' . auth()->user()->tenant_id,
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|in:new_scheme,extension,rehabilitation,upgrade,emergency',
            'estimated_cost' => 'sometimes|numeric|min:0',
            'budget_year' => 'sometimes|integer|min:2000|max:2100',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'actual_start_date' => 'nullable|date',
            'actual_end_date' => 'nullable|date|after_or_equal:actual_start_date',
            'physical_progress' => 'nullable|numeric|min:0|max:100',
            'financial_progress' => 'nullable|numeric|min:0|max:100',
            'status' => 'sometimes|in:planning,tendering,execution,suspended,completed,closed',
            'location' => 'nullable|array',
            'location.type' => 'required_with:location|in:Polygon',
            'location.coordinates' => 'required_with:location|array',
            'meta' => 'nullable|array',
        ];
    }
}
