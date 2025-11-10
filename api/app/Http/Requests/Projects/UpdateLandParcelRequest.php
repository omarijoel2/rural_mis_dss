<?php

namespace App\Http\Requests\Projects;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLandParcelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $parcelId = $this->route('parcel');
        
        return [
            'ref_no' => 'sometimes|string|max:100|unique:land_parcels,ref_no,' . $parcelId . ',id,tenant_id,' . auth()->user()->tenant_id,
            'title_deed_no' => 'nullable|string|max:100',
            'area_ha' => 'sometimes|numeric|min:0',
            'owner_name' => 'sometimes|string|max:255',
            'owner_contact' => 'nullable|string|max:255',
            'boundary' => 'sometimes|array',
            'boundary.type' => 'required_with:boundary|in:Polygon',
            'boundary.coordinates' => 'required_with:boundary|array',
            'county' => 'nullable|string|max:100',
            'sub_county' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:land_categories,id',
            'project_id' => 'nullable|exists:projects,id',
            'acquisition_status' => 'sometimes|in:identified,valuation,negotiation,acquired,disputed',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ];
    }
}
