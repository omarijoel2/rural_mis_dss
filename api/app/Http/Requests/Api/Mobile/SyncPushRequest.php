<?php

namespace App\Http\Requests\Api\Mobile;

use Illuminate\Foundation\Http\FormRequest;

class SyncPushRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'device_id' => 'required|string',
            'client_sync_token' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.resource_type' => 'required|string',
            'items.*.action' => 'required|in:create,update,delete',
            'items.*.payload' => 'nullable|array',
            'items.*.client_version' => 'nullable|integer',
            'items.*.client_temp_id' => 'nullable|string',
        ];
    }
}
