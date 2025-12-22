<?php

namespace App\Http\Requests\Api\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class TelemetryBatchRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'device_id' => 'required|string',
            'metrics' => 'required|array',
            'metrics.*.name' => 'required|string',
            'metrics.*.timestamp' => 'required|date',
            'metrics.*.value' => 'required|numeric',
        ];
    }
}
