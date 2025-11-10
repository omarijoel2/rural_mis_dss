<?php

namespace App\Http\Requests\Costing;

use Illuminate\Foundation\Http\FormRequest;

class ExecuteAllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'version_id' => ['nullable', 'string', 'exists:budget_versions,id', 'required_without:forecast_id'],
            'forecast_id' => ['nullable', 'string', 'exists:forecasts,id', 'required_without:version_id'],
            'period_from' => ['required', 'date'],
            'period_to' => ['required', 'date', 'after_or_equal:period_from'],
        ];
    }

    public function messages(): array
    {
        return [
            'version_id.required_without' => 'Either version_id or forecast_id is required.',
            'forecast_id.required_without' => 'Either version_id or forecast_id is required.',
        ];
    }
}
