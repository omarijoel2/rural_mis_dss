<?php

namespace App\Http\Requests\Costing;

use Illuminate\Foundation\Http\FormRequest;

class StoreAllocationRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'basis' => ['required', 'string', 'in:driver,percentage,equal,formula'],
            'driver_id' => ['nullable', 'string', 'exists:drivers,id', 'required_if:basis,driver'],
            'percentage' => ['nullable', 'numeric', 'min:0', 'max:100', 'required_if:basis,percentage'],
            'formula' => ['nullable', 'string', 'required_if:basis,formula'],
            'applies_to' => ['required', 'string', 'max:100'],
            'active' => ['nullable', 'boolean'],
            'scope_filter' => ['nullable', 'array'],
        ];
    }
}
