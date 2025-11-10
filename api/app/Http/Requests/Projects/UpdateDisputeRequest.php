<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dispute_no' => 'sometimes|string|max:50',
            'description' => 'sometimes|string',
            'type' => 'sometimes|in:ownership,boundary,compensation,wayleave,other',
            'raised_date' => 'nullable|date',
            'resolved_date' => 'nullable|date|after_or_equal:raised_date',
            'status' => 'sometimes|in:open,mediation,legal,resolved,closed',
            'claimant_name' => 'nullable|string|max:255',
            'claimant_contact' => 'nullable|string|max:255',
            'resolution_notes' => 'nullable|string',
            'settlement_amount' => 'nullable|numeric|min:0',
            'handled_by' => 'nullable|exists:users,id',
        ];
    }
}
