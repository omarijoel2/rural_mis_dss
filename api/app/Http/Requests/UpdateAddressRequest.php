<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'sometimes|uuid|exists:schemes,id',
            'premise_code' => 'sometimes|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'street' => 'sometimes|nullable|string|max:255',
            'village' => 'sometimes|nullable|string|max:255',
            'ward' => 'sometimes|nullable|string|max:255',
            'subcounty' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|nullable|string|max:255',
            'postcode' => 'sometimes|nullable|string|max:20',
            'country' => 'sometimes|nullable|string|max:255',
            'location' => 'sometimes|nullable|array',
            'what3words' => 'sometimes|nullable|string|max:255',
            'meta' => 'sometimes|nullable|array',
        ];
    }
}
