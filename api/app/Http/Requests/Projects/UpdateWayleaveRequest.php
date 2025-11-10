<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWayleaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wayleave_no' => 'sometimes|string|max:50',
            'type' => 'sometimes|in:pipeline,power_line,access_road,temporary,other',
            'width_m' => 'nullable|numeric|min:0',
            'length_m' => 'nullable|numeric|min:0',
            'agreement_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:agreement_date',
            'status' => 'sometimes|in:pending,active,expired,terminated,disputed',
            'annual_fee' => 'nullable|numeric|min:0',
            'terms' => 'nullable|string',
            'documents' => 'nullable|array',
        ];
    }
}
