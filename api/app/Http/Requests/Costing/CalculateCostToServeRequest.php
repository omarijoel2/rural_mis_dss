<?php

namespace App\Http\Requests\Costing;

use Illuminate\Foundation\Http\FormRequest;

class CalculateCostToServeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'period' => ['required', 'date'],
            'scheme_id' => ['nullable', 'string', 'exists:schemes,id'],
            'dma_id' => ['nullable', 'string', 'exists:dmas,id'],
            'class' => ['nullable', 'string', 'max:100'],
            'production_m3' => ['required', 'numeric', 'min:0'],
            'billed_m3' => ['required', 'numeric', 'min:0'],
            'revenue' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
