<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class StoreDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dispute_no' => 'required|string|max:50',
            'description' => 'required|string',
            'type' => 'required|in:ownership,boundary,compensation,wayleave,other',
            'raised_date' => 'nullable|date',
            'status' => 'nullable|in:open,mediation,legal,resolved,closed',
            'claimant_name' => 'nullable|string|max:255',
            'claimant_contact' => 'nullable|string|max:255',
        ];
    }
}
