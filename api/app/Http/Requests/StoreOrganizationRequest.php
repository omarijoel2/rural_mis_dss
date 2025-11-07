<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'org_code' => 'required|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'required|string|min:3|max:140',
            'type' => 'required|in:utility,contractor,government,ngo',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'geom' => 'nullable|array',
            'meta' => 'nullable|array',
        ];
    }
}
