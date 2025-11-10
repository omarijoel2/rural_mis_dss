<?php

namespace App\Http\Requests\Costing;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBudgetVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'fiscal_year' => ['sometimes', 'integer', 'min:2000', 'max:2100'],
            'status' => ['sometimes', 'string', 'in:draft,submitted,approved,archived'],
            'is_rolling' => ['sometimes', 'boolean'],
        ];
    }
}
