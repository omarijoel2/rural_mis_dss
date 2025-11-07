<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'premise_code' => 'required|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'street' => 'nullable|string|max:255',
            'village' => 'nullable|string|max:255',
            'ward' => 'nullable|string|max:255',
            'subcounty' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postcode' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'location' => 'nullable|array',
            'what3words' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
        ];
    }
}
