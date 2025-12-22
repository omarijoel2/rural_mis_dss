<?php

namespace App\Http\Requests\Api\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class DeviceRegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true; // adjust to auth rules if required
    }

    public function rules()
    {
        return [
            'device_id' => 'required|string',
            'device_type' => 'required|string',
            'os_version' => 'nullable|string',
            'app_version' => 'nullable|string',
            'push_token' => 'nullable|string',
            'metadata' => 'nullable|array',
        ];
    }
}
