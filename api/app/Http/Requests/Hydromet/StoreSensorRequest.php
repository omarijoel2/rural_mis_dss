<?php

namespace App\Http\Requests\Hydromet;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parameter_id' => 'required|exists:sensor_parameters,id',
            'make' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'multiplier' => 'nullable|numeric|min:0|max:1000',
            'offset' => 'nullable|numeric|min:-1000|max:1000',
            'installed_at' => 'nullable|date',
            'calibrated_at' => 'nullable|date',
            'active' => 'sometimes|boolean',
            'meta' => 'nullable|array',
        ];
    }
}
