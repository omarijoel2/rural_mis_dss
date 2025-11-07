<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheme_id' => 'sometimes|uuid|exists:schemes,id',
            'code' => 'sometimes|string|max:32|regex:/^[A-Z0-9_-]+$/',
            'name' => 'sometimes|string|min:3|max:140',
            'category' => 'sometimes|in:source,treatment,pumpstation,reservoir,office,workshop,warehouse,lab',
            'status' => 'sometimes|in:active,standby,decommissioned',
            'location' => 'sometimes|nullable|array',
            'address' => 'sometimes|nullable|string',
            'commissioned_on' => 'sometimes|nullable|date',
            'meta' => 'sometimes|nullable|array',
        ];
    }
}
