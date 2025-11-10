<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppraisalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appraisal_no' => 'required|string|max:50',
            'capex' => 'required|numeric|min:0',
            'opex_annual' => 'nullable|numeric|min:0',
            'project_life_years' => 'required|integer|min:1|max:100',
            'discount_rate' => 'required|numeric|min:0|max:1',
            'executive_summary' => 'nullable|string',
            'risks' => 'nullable|string',
            'assumptions' => 'nullable|string',
            'recommendation' => 'nullable|in:approve,reject,defer,revise',
            'recommendation_notes' => 'nullable|string',
            'cash_flows' => 'nullable|array',
            'appraisal_date' => 'nullable|date',
            'meta' => 'nullable|array',
        ];
    }
}
