<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoreOpsAssetClassesSeeder extends Seeder
{
    public function run(): void
    {
        $coreOpsClasses = [
            [
                'code' => 'PUMP',
                'name' => 'Pumps',
                'parent_id' => null,
                'criticality' => 'high',
                'attributes_schema' => json_encode([
                    'rated_power_kw' => 'number',
                    'rated_flow_m3h' => 'number',
                    'rated_head_m' => 'number',
                    'efficiency_pct' => 'number',
                    'motor_type' => 'string',
                    'impeller_diameter_mm' => 'number',
                    'vfd_enabled' => 'boolean',
                ]),
            ],
            [
                'code' => 'VALVE',
                'name' => 'Valves',
                'parent_id' => null,
                'criticality' => 'medium',
                'attributes_schema' => json_encode([
                    'valve_type' => 'string',
                    'diameter_mm' => 'number',
                    'actuator_type' => 'string',
                    'pressure_rating_bar' => 'number',
                    'normally_open' => 'boolean',
                ]),
            ],
            [
                'code' => 'PRV',
                'name' => 'Pressure Reducing Valves',
                'parent_id' => null,
                'criticality' => 'high',
                'attributes_schema' => json_encode([
                    'diameter_mm' => 'number',
                    'upstream_pressure_bar' => 'number',
                    'downstream_setpoint_bar' => 'number',
                    'modulating' => 'boolean',
                    'pilot_type' => 'string',
                ]),
            ],
            [
                'code' => 'METER',
                'name' => 'Flow Meters',
                'parent_id' => null,
                'criticality' => 'medium',
                'attributes_schema' => json_encode([
                    'meter_type' => 'string',
                    'diameter_mm' => 'number',
                    'max_flow_m3h' => 'number',
                    'accuracy_class' => 'string',
                    'pulse_rate' => 'number',
                    'telemetry_enabled' => 'boolean',
                ]),
            ],
            [
                'code' => 'RESERVOIR',
                'name' => 'Reservoirs & Tanks',
                'parent_id' => null,
                'criticality' => 'high',
                'attributes_schema' => json_encode([
                    'capacity_m3' => 'number',
                    'material' => 'string',
                    'height_m' => 'number',
                    'diameter_m' => 'number',
                    'level_sensor_type' => 'string',
                    'overflow_elevation_m' => 'number',
                    'min_operating_level_m' => 'number',
                ]),
            ],
            [
                'code' => 'CHLORINATOR',
                'name' => 'Chlorinators',
                'parent_id' => null,
                'criticality' => 'high',
                'attributes_schema' => json_encode([
                    'dosing_type' => 'string',
                    'max_dose_rate_kgd' => 'number',
                    'chemical_type' => 'string',
                    'control_mode' => 'string',
                    'residual_sensor_enabled' => 'boolean',
                ]),
            ],
            [
                'code' => 'FLOWMETER_MAG',
                'name' => 'Electromagnetic Flow Meter',
                'parent_id' => null,
                'criticality' => 'medium',
                'attributes_schema' => json_encode([
                    'diameter_mm' => 'number',
                    'accuracy_pct' => 'number',
                    'output_type' => 'string',
                    'electrode_material' => 'string',
                ]),
            ],
            [
                'code' => 'LOGGER',
                'name' => 'Data Logger / RTU',
                'parent_id' => null,
                'criticality' => 'medium',
                'attributes_schema' => json_encode([
                    'manufacturer' => 'string',
                    'model' => 'string',
                    'comm_type' => 'string',
                    'analog_inputs' => 'number',
                    'digital_inputs' => 'number',
                    'analog_outputs' => 'number',
                    'digital_outputs' => 'number',
                ]),
            ],
        ];

        foreach ($coreOpsClasses as $class) {
            DB::table('asset_classes')->updateOrInsert(
                ['code' => $class['code']],
                array_merge($class, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
