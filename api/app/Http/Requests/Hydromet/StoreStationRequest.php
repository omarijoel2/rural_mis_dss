<?php

namespace App\Http\Requests\Hydromet;

use Illuminate\Foundation\Http\FormRequest;

class StoreStationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:hydromet_stations,code',
            'station_type_id' => 'required|exists:station_types,id',
            'datasource_id' => 'required|exists:datasources,id',
            'scheme_id' => 'nullable|uuid|exists:schemes,id',
            'elevation_m' => 'nullable|numeric|min:0|max:10000',
            'active' => 'sometimes|boolean',
            'latitude' => 'nullable|numeric|min:-90|max:90',
            'longitude' => 'nullable|numeric|min:-180|max:180',
            'meta' => 'nullable|array',
        ];
    }
}
