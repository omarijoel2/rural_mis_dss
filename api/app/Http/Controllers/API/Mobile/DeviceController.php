<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Mobile\DeviceRegisterRequest;
use App\Models\MobileDevice;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function register(DeviceRegisterRequest $req)
    {
        $data = $req->validated();
        $device = MobileDevice::updateOrCreate(['device_id' => $data['device_id']], $data);
        return response()->json($device, 201);
    }

    public function index(Request $req)
    {
        $devices = MobileDevice::paginate($req->get('per_page', 50));
        return response()->json($devices);
    }

    public function update(Request $req, MobileDevice $device)
    {
        $device->update($req->only(['status', 'metadata', 'push_token']));
        return response()->json($device);
    }
}
