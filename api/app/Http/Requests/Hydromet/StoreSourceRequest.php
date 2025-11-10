<?php

namespace App\Http\Requests\Hydromet;

use Illuminate\Foundation\Http\FormRequest;

class StoreSourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:sources,code',
            'kind_id' => 'required|exists:source_kinds,id',
            'status_id' => 'required|exists:source_statuses,id',
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'catchment' => 'nullable|string|max:255',
            'elevation_m' => 'nullable|numeric|min:0|max:10000',
            'depth_m' => 'nullable|numeric|min:0|max:1000',
            'static_level_m' => 'nullable|numeric|min:0|max:1000',
            'dynamic_level_m' => 'nullable|numeric|min:0|max:1000',
            'capacity_m3_per_day' => 'nullable|numeric|min:0|max:1000000',
            'permit_no' => 'nullable|string|max:255',
            'permit_expiry' => 'nullable|date',
            'quality_risk_id' => 'nullable|exists:quality_risk_levels,id',
            'latitude' => 'nullable|numeric|min:-90|max:90',
            'longitude' => 'nullable|numeric|min:-180|max:180',
            'meta' => 'nullable|array',
        ];
    }
}
