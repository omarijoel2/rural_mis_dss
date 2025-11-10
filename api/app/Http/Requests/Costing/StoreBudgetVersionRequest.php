<?php

namespace App\Http\Requests\Costing;

use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'fiscal_year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'status' => ['nullable', 'string', 'in:draft,submitted,approved,archived'],
            'is_rolling' => ['nullable', 'boolean'],
            'base_version_id' => ['nullable', 'string', 'exists:budget_versions,id'],
        ];
    }
}
