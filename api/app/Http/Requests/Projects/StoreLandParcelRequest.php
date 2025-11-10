<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class StoreLandParcelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ref_no' => 'required|string|max:100|unique:land_parcels,ref_no,NULL,id,tenant_id,' . auth()->user()->tenant_id,
            'title_deed_no' => 'nullable|string|max:100',
            'area_ha' => 'required|numeric|min:0',
            'owner_name' => 'required|string|max:255',
            'owner_contact' => 'nullable|string|max:255',
            'boundary' => 'required|array',
            'boundary.type' => 'required|in:Polygon',
            'boundary.coordinates' => 'required|array',
            'county' => 'nullable|string|max:100',
            'sub_county' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:land_categories,id',
            'project_id' => 'nullable|exists:projects,id',
            'acquisition_status' => 'nullable|in:identified,valuation,negotiation,acquired,disputed',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ];
    }
}
