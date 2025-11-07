<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'required|uuid|exists:schemes,id',
            'code' => 'required|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'required|string|min:3|max:140',
            'category' => 'required|in:source,treatment,pumpstation,reservoir,office,workshop,warehouse,lab',
            'status' => 'required|in:active,standby,decommissioned',
            'location' => 'nullable|array',
            'address' => 'nullable|string',
            'commissioned_on' => 'nullable|date',
            'meta' => 'nullable|array',
        ];
    }
}
