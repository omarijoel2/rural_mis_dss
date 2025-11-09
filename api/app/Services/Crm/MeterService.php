<?php

namespace App\Services\Crm;

use App\Models\CrmMeter;
use App\Models\CrmCustomerRead;
use App\Models\CrmServiceConnection;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Collection;
use MatanYadaev\EloquentSpatial\Objects\Point;
use Carbon\Carbon;

class MeterService
{
    public function createMeter(array $data, User $user): CrmMeter
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'connection_id' => 'required|exists:crm_service_connections,id',
            'serial' => 'required|string|max:100',
            'brand' => 'nullable|string|max:100',
            'size_mm' => 'nullable|integer|in:15,20,25,32,40,50',
            'install_date' => 'required|date',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $connection = CrmServiceConnection::whereHas('premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->findOrFail($data['connection_id']);

        $existingMeter = CrmMeter::where('serial', $data['serial'])
            ->whereHas('connection.premise', function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            })->exists();

        if ($existingMeter) {
            throw ValidationException::withMessages([
                'serial' => ['A meter with this serial number already exists in your organization.']
            ]);
        }

        return CrmMeter::create([
            'connection_id' => $data['connection_id'],
            'serial' => $data['serial'],
            'brand' => $data['brand'] ?? null,
            'size_mm' => $data['size_mm'] ?? null,
            'install_date' => $data['install_date'],
            'status' => 'active',
            'meta' => $data['meta'] ?? null,
        ]);
    }

    public function recordRead(array $data, User $user): CrmCustomerRead
    {
        $tenantId = $user->currentTenantId();

        $validator = Validator::make($data, [
            'meter_id' => 'required|exists:crm_meters,id',
            'read_at' => 'required|date',
            'value' => 'required|numeric|min:0',
            'photo_path' => 'nullable|string|max:500',
            'read_source' => 'required|in:manual,app,ami,import',
            'quality' => 'nullable|in:good,estimated,bad',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $meter = CrmMeter::whereHas('connection.premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->findOrFail($data['meter_id']);

        if ($meter->last_read && $data['value'] < $meter->last_read) {
            throw ValidationException::withMessages([
                'value' => ['Meter reading cannot be less than the previous reading.']
            ]);
        }

        $geom = null;
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $geom = new Point($data['latitude'], $data['longitude']);
        }

        $read = CrmCustomerRead::create([
            'meter_id' => $data['meter_id'],
            'read_at' => $data['read_at'],
            'value' => $data['value'],
            'photo_path' => $data['photo_path'] ?? null,
            'read_source' => $data['read_source'],
            'quality' => $data['quality'] ?? 'good',
            'reader_id' => $user->id,
            'geom' => $geom,
            'meta' => $data['meta'] ?? null,
        ]);

        $meter->update([
            'last_read' => $data['value'],
            'last_read_at' => $data['read_at'],
        ]);

        return $read;
    }

    public function getMeterReads(int $meterId, int $limit, User $user): Collection
    {
        $tenantId = $user->currentTenantId();

        $meter = CrmMeter::whereHas('connection.premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->findOrFail($meterId);

        return $meter->reads()
            ->orderBy('read_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function detectAnomalies(int $meterId, User $user): array
    {
        $tenantId = $user->currentTenantId();

        $meter = CrmMeter::whereHas('connection.premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->findOrFail($meterId);

        $reads = $meter->reads()
            ->where('quality', 'good')
            ->orderBy('read_at', 'asc')
            ->get();

        if ($reads->count() < 3) {
            return [
                'anomalies' => [],
                'status' => 'insufficient_data',
            ];
        }

        $consumptions = [];
        for ($i = 1; $i < $reads->count(); $i++) {
            $prev = $reads[$i - 1];
            $curr = $reads[$i];
            $consumed = $curr->value - $prev->value;
            $days = Carbon::parse($prev->read_at)->diffInDays(Carbon::parse($curr->read_at));

            if ($days > 0) {
                $consumptions[] = $consumed / $days;
            }
        }

        if (empty($consumptions)) {
            return [
                'anomalies' => [],
                'status' => 'no_valid_consumption',
            ];
        }

        $avg = array_sum($consumptions) / count($consumptions);
        $stdDev = sqrt(array_sum(array_map(fn($x) => pow($x - $avg, 2), $consumptions)) / count($consumptions));

        $anomalies = [];
        $threshold = $avg + (2 * $stdDev);

        for ($i = 0; $i < count($consumptions); $i++) {
            if ($consumptions[$i] > $threshold) {
                $anomalies[] = [
                    'read_index' => $i + 1,
                    'consumption_per_day' => round($consumptions[$i], 2),
                    'threshold' => round($threshold, 2),
                    'deviation_percent' => round((($consumptions[$i] - $avg) / $avg) * 100, 2),
                ];
            }
        }

        return [
            'anomalies' => $anomalies,
            'status' => 'analyzed',
            'average_consumption_per_day' => round($avg, 2),
            'threshold' => round($threshold, 2),
        ];
    }

    public function replaceMeter(int $oldMeterId, array $newMeterData, User $user): CrmMeter
    {
        $tenantId = $user->currentTenantId();

        $oldMeter = CrmMeter::whereHas('connection.premise', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId);
        })->findOrFail($oldMeterId);

        $oldMeter->update(['status' => 'retired']);

        $newMeterData['connection_id'] = $oldMeter->connection_id;
        $newMeterData['install_date'] = now();

        return $this->createMeter($newMeterData, $user);
    }
}
