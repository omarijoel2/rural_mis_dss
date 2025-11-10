<?php

namespace App\Http\Requests\Costing;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAllocationRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'basis' => ['sometimes', 'string', 'in:driver,percentage,equal,formula'],
            'driver_id' => ['nullable', 'string', 'exists:drivers,id'],
            'percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'formula' => ['nullable', 'string'],
            'applies_to' => ['sometimes', 'string', 'max:100'],
            'active' => ['sometimes', 'boolean'],
            'scope_filter' => ['nullable', 'array'],
        ];
    }
}
