<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
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
            'org_code' => 'sometimes|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'sometimes|string|min:3|max:140',
            'type' => 'sometimes|in:utility,contractor,government,ngo',
            'email' => 'sometimes|nullable|email',
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string',
            'geom' => 'sometimes|nullable|array',
            'meta' => 'sometimes|nullable|array',
        ];
    }
}
