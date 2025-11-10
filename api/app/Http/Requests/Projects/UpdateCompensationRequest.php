<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompensationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comp_no' => 'sometimes|string|max:50',
            'valuation_amount' => 'sometimes|numeric|min:0',
            'negotiated_amount' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'comp_type' => 'sometimes|in:land_acquisition,crops,structures,disturbance,other',
            'valuation_date' => 'sometimes|date',
            'payment_date' => 'nullable|date',
            'payment_reference' => 'nullable|string|max:100',
            'status' => 'sometimes|in:valued,negotiated,approved,paid,disputed',
            'valuation_notes' => 'nullable|string',
            'valued_by' => 'nullable|exists:users,id',
            'approved_by' => 'nullable|exists:users,id',
            'meta' => 'nullable|array',
        ];
    }
}
