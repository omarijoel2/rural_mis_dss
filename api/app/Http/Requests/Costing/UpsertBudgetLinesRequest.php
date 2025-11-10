<?php

namespace App\Http\Requests\Costing;

use Illuminate\Foundation\Http\FormRequest;

class UpsertBudgetLinesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.cost_center_id' => ['required', 'string', 'exists:cost_centers,id'],
            'lines.*.gl_account_id' => ['required', 'string', 'exists:gl_accounts,id'],
            'lines.*.period' => ['required', 'date'],
            'lines.*.amount' => ['required', 'numeric'],
            'lines.*.class' => ['nullable', 'string', 'max:100'],
            'lines.*.scheme_id' => ['nullable', 'string', 'exists:schemes,id'],
            'lines.*.dma_id' => ['nullable', 'string', 'exists:dmas,id'],
            'lines.*.project_id' => ['nullable', 'string'],
            'lines.*.meta' => ['nullable', 'array'],
        ];
    }
}
