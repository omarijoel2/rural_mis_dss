<?php

namespace Database\Seeders;

use App\Models\WqParameter;
use App\Models\WqSamplingPoint;
use App\Models\WqPlan;
use App\Models\WqPlanRule;
use App\Models\WqSample;
use App\Models\WqSampleParam;
use App\Models\WqResult;
use App\Models\Organization;
use App\Models\Facility;
use App\Models\Scheme;
use App\Models\User;
use Illuminate\Database\Seeder;
use MatanYadaev\EloquentSpatial\Objects\Point;
use Carbon\Carbon;

class WaterQualitySeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting Water Quality module seeder...');

        $tenant = Organization::first();
        if (!$tenant) {
            $this->command->error('No organization found. Please run core seeder first.');
            return;
        }

        $user = User::where('email', 'admin@kwu.test')->first();
        if (!$user) {
            $user = User::first();
        }

        $facility = Facility::first();
        $scheme = Scheme::first();

        $this->seedParameters();
        $this->seedSamplingPoints($tenant, $facility, $scheme);
        $this->seedPlansAndSamples($tenant, $user);
        $this->seedResults($user);

        $this->command->info('Water Quality seeder completed successfully!');
    }

    protected function seedParameters(): void
    {
        $this->command->info('Creating water quality parameters...');

        $parameters = [
            // Physical Parameters
            ['name' => 'pH', 'code' => 'PH', 'group' => 'physical', 'unit' => 'pH units', 'method' => 'pH meter', 'who_limit' => null, 'wasreb_limit' => null, 'local_limit' => null],
            ['name' => 'Turbidity', 'code' => 'TURB', 'group' => 'physical', 'unit' => 'NTU', 'method' => 'Nephelometric', 'who_limit' => 5, 'wasreb_limit' => 5, 'local_limit' => 5],
            ['name' => 'Temperature', 'code' => 'TEMP', 'group' => 'physical', 'unit' => '°C', 'method' => 'Thermometer', 'who_limit' => null, 'wasreb_limit' => null, 'local_limit' => null],
            ['name' => 'Color', 'code' => 'COLOR', 'group' => 'physical', 'unit' => 'TCU', 'method' => 'Spectrophotometer', 'who_limit' => 15, 'wasreb_limit' => 15, 'local_limit' => 15],
            ['name' => 'Conductivity', 'code' => 'COND', 'group' => 'physical', 'unit' => 'µS/cm', 'method' => 'Conductivity meter', 'who_limit' => null, 'wasreb_limit' => null, 'local_limit' => null],
            ['name' => 'Total Dissolved Solids', 'code' => 'TDS', 'group' => 'physical', 'unit' => 'mg/L', 'method' => 'Gravimetric', 'who_limit' => 1000, 'wasreb_limit' => 1000, 'local_limit' => 600],

            // Chemical Parameters
            ['name' => 'Chlorine (Residual Free)', 'code' => 'CL2', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'DPD Colorimetric', 'who_limit' => null, 'wasreb_limit' => 0.2, 'local_limit' => 0.3],
            ['name' => 'Fluoride', 'code' => 'F', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'Ion Selective Electrode', 'who_limit' => 1.5, 'wasreb_limit' => 1.5, 'local_limit' => 1.5],
            ['name' => 'Nitrate', 'code' => 'NO3', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'UV Spectrophotometry', 'who_limit' => 50, 'wasreb_limit' => 50, 'local_limit' => 50],
            ['name' => 'Nitrite', 'code' => 'NO2', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'Colorimetric', 'who_limit' => 3, 'wasreb_limit' => 3, 'local_limit' => 3],
            ['name' => 'Ammonia', 'code' => 'NH3', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'Nessler Method', 'who_limit' => 1.5, 'wasreb_limit' => 1.5, 'local_limit' => 1.5],
            ['name' => 'Iron', 'code' => 'FE', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'AAS', 'who_limit' => null, 'wasreb_limit' => 0.3, 'local_limit' => 0.3],
            ['name' => 'Manganese', 'code' => 'MN', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'AAS', 'who_limit' => null, 'wasreb_limit' => 0.1, 'local_limit' => 0.1],
            ['name' => 'Aluminum', 'code' => 'AL', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'AAS', 'who_limit' => null, 'wasreb_limit' => 0.2, 'local_limit' => 0.2],
            ['name' => 'Lead', 'code' => 'PB', 'group' => 'chemical', 'unit' => 'µg/L', 'method' => 'ICP-MS', 'who_limit' => 10, 'wasreb_limit' => 10, 'local_limit' => 10],
            ['name' => 'Arsenic', 'code' => 'AS', 'group' => 'chemical', 'unit' => 'µg/L', 'method' => 'ICP-MS', 'who_limit' => 10, 'wasreb_limit' => 10, 'local_limit' => 10],
            ['name' => 'Chromium', 'code' => 'CR', 'group' => 'chemical', 'unit' => 'µg/L', 'method' => 'AAS', 'who_limit' => 50, 'wasreb_limit' => 50, 'local_limit' => 50],
            ['name' => 'Sulfate', 'code' => 'SO4', 'group' => 'chemical', 'unit' => 'mg/L', 'method' => 'Turbidimetric', 'who_limit' => null, 'wasreb_limit' => 250, 'local_limit' => 250],
            ['name' => 'Alkalinity', 'code' => 'ALK', 'group' => 'chemical', 'unit' => 'mg/L as CaCO3', 'method' => 'Titration', 'who_limit' => null, 'wasreb_limit' => null, 'local_limit' => null],
            ['name' => 'Hardness (Total)', 'code' => 'HARD', 'group' => 'chemical', 'unit' => 'mg/L as CaCO3', 'method' => 'EDTA Titration', 'who_limit' => null, 'wasreb_limit' => 500, 'local_limit' => 300],

            // Biological Parameters
            ['name' => 'E. coli', 'code' => 'ECOLI', 'group' => 'biological', 'unit' => 'CFU/100mL', 'method' => 'Membrane Filtration', 'who_limit' => 0, 'wasreb_limit' => 0, 'local_limit' => 0],
            ['name' => 'Total Coliforms', 'code' => 'TC', 'group' => 'biological', 'unit' => 'CFU/100mL', 'method' => 'Membrane Filtration', 'who_limit' => 0, 'wasreb_limit' => 0, 'local_limit' => 0],
            ['name' => 'Fecal Coliforms', 'code' => 'FC', 'group' => 'biological', 'unit' => 'CFU/100mL', 'method' => 'Membrane Filtration', 'who_limit' => 0, 'wasreb_limit' => 0, 'local_limit' => 0],
            ['name' => 'Heterotrophic Plate Count', 'code' => 'HPC', 'group' => 'biological', 'unit' => 'CFU/mL', 'method' => 'Pour Plate', 'who_limit' => null, 'wasreb_limit' => 500, 'local_limit' => 500],
            ['name' => 'Pseudomonas aeruginosa', 'code' => 'PSEUDO', 'group' => 'biological', 'unit' => 'CFU/100mL', 'method' => 'Membrane Filtration', 'who_limit' => 0, 'wasreb_limit' => 0, 'local_limit' => 0],
        ];

        foreach ($parameters as $paramData) {
            WqParameter::firstOrCreate(
                ['code' => $paramData['code']],
                array_merge($paramData, ['is_active' => true])
            );
        }

        $this->command->info('Created ' . count($parameters) . ' water quality parameters.');
    }

    protected function seedSamplingPoints($tenant, $facility, $scheme): void
    {
        $this->command->info('Creating sampling points...');

        $points = [
            // Source Points
            ['name' => 'Borehole #1', 'code' => 'BH-001', 'kind' => 'source', 'lat' => -1.2921, 'lng' => 36.8219, 'elevation_m' => 1700],
            ['name' => 'Borehole #2', 'code' => 'BH-002', 'kind' => 'source', 'lat' => -1.2845, 'lng' => 36.8195, 'elevation_m' => 1680],
            ['name' => 'Spring Intake', 'code' => 'SPR-001', 'kind' => 'source', 'lat' => -1.3012, 'lng' => 36.8301, 'elevation_m' => 1820],

            // Treatment Points
            ['name' => 'Treatment Plant Inlet', 'code' => 'TP-IN-01', 'kind' => 'treatment', 'lat' => -1.2890, 'lng' => 36.8240, 'elevation_m' => 1720],
            ['name' => 'Treatment Plant Outlet', 'code' => 'TP-OUT-01', 'kind' => 'treatment', 'lat' => -1.2892, 'lng' => 36.8243, 'elevation_m' => 1720],
            ['name' => 'Chlorination Point', 'code' => 'CHL-001', 'kind' => 'treatment', 'lat' => -1.2891, 'lng' => 36.8242, 'elevation_m' => 1720],

            // Reservoir Points
            ['name' => 'Main Reservoir', 'code' => 'RES-001', 'kind' => 'reservoir', 'lat' => -1.2950, 'lng' => 36.8280, 'elevation_m' => 1750],
            ['name' => 'Secondary Tank', 'code' => 'RES-002', 'kind' => 'reservoir', 'lat' => -1.2830, 'lng' => 36.8200, 'elevation_m' => 1690],

            // Distribution Points
            ['name' => 'Zone A Central', 'code' => 'DIST-A-01', 'kind' => 'distribution', 'lat' => -1.2900, 'lng' => 36.8250, 'elevation_m' => 1710],
            ['name' => 'Zone B North', 'code' => 'DIST-B-01', 'kind' => 'distribution', 'lat' => -1.2800, 'lng' => 36.8180, 'elevation_m' => 1670],
            ['name' => 'Zone C South', 'code' => 'DIST-C-01', 'kind' => 'distribution', 'lat' => -1.3000, 'lng' => 36.8320, 'elevation_m' => 1780],

            // Kiosk Points
            ['name' => 'Market Kiosk', 'code' => 'KIOSK-001', 'kind' => 'kiosk', 'lat' => -1.2920, 'lng' => 36.8260, 'elevation_m' => 1715],
            ['name' => 'School Kiosk', 'code' => 'KIOSK-002', 'kind' => 'kiosk', 'lat' => -1.2860, 'lng' => 36.8220, 'elevation_m' => 1695],

            // Household Points
            ['name' => 'Household Sample #1', 'code' => 'HH-001', 'kind' => 'household', 'lat' => -1.2910, 'lng' => 36.8255, 'elevation_m' => 1712],
            ['name' => 'Household Sample #2', 'code' => 'HH-002', 'kind' => 'household', 'lat' => -1.2870, 'lng' => 36.8225, 'elevation_m' => 1698],
        ];

        foreach ($points as $pointData) {
            WqSamplingPoint::firstOrCreate(
                ['code' => $pointData['code'], 'tenant_id' => $tenant->id],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $pointData['name'],
                    'code' => $pointData['code'],
                    'kind' => $pointData['kind'],
                    'facility_id' => $facility?->id,
                    'scheme_id' => $scheme?->id,
                    'location' => new Point($pointData['lat'], $pointData['lng']),
                    'elevation_m' => $pointData['elevation_m'],
                    'description' => 'Sampling point for ' . $pointData['name'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Created ' . count($points) . ' sampling points.');
    }

    protected function seedPlansAndSamples($tenant, $user): void
    {
        $this->command->info('Creating sampling plans and samples...');

        // Create quarterly plan
        $plan = WqPlan::firstOrCreate(
            ['name' => 'Q1 2024 Monitoring Plan', 'tenant_id' => $tenant->id],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Q1 2024 Monitoring Plan',
                'period_start' => '2024-01-01',
                'period_end' => '2024-03-31',
                'status' => 'active',
                'notes' => 'Quarterly water quality monitoring for all sampling points',
            ]
        );

        // Create sampling rules
        $rules = [
            ['point_kind' => 'source', 'parameter_group' => 'physical', 'frequency' => 'weekly', 'sample_count' => 1],
            ['point_kind' => 'treatment', 'parameter_group' => 'chemical', 'frequency' => 'weekly', 'sample_count' => 1],
            ['point_kind' => 'distribution', 'parameter_group' => 'biological', 'frequency' => 'monthly', 'sample_count' => 2],
        ];

        foreach ($rules as $ruleData) {
            WqPlanRule::firstOrCreate(
                array_merge($ruleData, ['plan_id' => $plan->id]),
                [
                    'plan_id' => $plan->id,
                    'point_kind' => $ruleData['point_kind'],
                    'parameter_group' => $ruleData['parameter_group'],
                    'frequency' => $ruleData['frequency'],
                    'sample_count' => $ruleData['sample_count'],
                    'container_type' => 'Sterile bottle',
                    'preservatives' => 'None',
                    'holding_time_hrs' => 24,
                ]
            );
        }

        // Create some scheduled samples
        $samplingPoints = WqSamplingPoint::where('tenant_id', $tenant->id)->limit(10)->get();
        $parameters = WqParameter::where('is_active', true)->limit(10)->get();

        $sampleCount = 0;
        foreach ($samplingPoints->take(5) as $point) {
            for ($i = 0; $i < 3; $i++) {
                $scheduledDate = Carbon::now()->subDays(rand(1, 30));
                
                $sample = WqSample::create([
                    'sampling_point_id' => $point->id,
                    'plan_id' => $plan->id,
                    'barcode' => 'WQ' . $scheduledDate->format('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6)),
                    'scheduled_for' => $scheduledDate,
                    'collected_at' => $scheduledDate->copy()->addHours(2),
                    'collected_by' => $user->id,
                    'custody_state' => 'received_lab',
                    'temp_c_on_receipt' => rand(18, 25),
                    'photos' => [],
                    'chain' => [
                        [
                            'state' => 'collected',
                            'timestamp' => $scheduledDate->copy()->addHours(2),
                            'user_id' => $user->id,
                            'user_name' => $user->name,
                        ],
                        [
                            'state' => 'received_lab',
                            'timestamp' => $scheduledDate->copy()->addHours(4),
                            'user_id' => $user->id,
                            'user_name' => $user->name,
                        ]
                    ],
                ]);

                // Add parameters to sample
                foreach ($parameters->take(rand(3, 6)) as $param) {
                    WqSampleParam::create([
                        'sample_id' => $sample->id,
                        'parameter_id' => $param->id,
                        'status' => 'in_analysis',
                        'method' => $param->method,
                    ]);
                }

                $sampleCount++;
            }
        }

        $this->command->info("Created plan with {$sampleCount} samples.");
    }

    protected function seedResults($user): void
    {
        $this->command->info('Creating sample results...');

        $sampleParams = WqSampleParam::with('parameter')->limit(50)->get();

        $resultCount = 0;
        foreach ($sampleParams as $sampleParam) {
            $param = $sampleParam->parameter;
            
            // Generate realistic values based on parameter type
            $value = $this->generateRealisticValue($param);
            
            WqResult::create([
                'sample_param_id' => $sampleParam->id,
                'value' => $value,
                'value_qualifier' => null,
                'unit' => $param->unit,
                'analyzed_at' => now()->subDays(rand(0, 15)),
                'analyst_id' => $user->id,
                'instrument' => $this->getInstrumentForMethod($param->method),
                'lod' => $this->getLOD($param),
                'uncertainty' => $value * 0.05, // 5% uncertainty
                'qc_flags' => $this->generateQcFlags($value, $param),
            ]);

            $sampleParam->update(['status' => 'resulted']);
            $resultCount++;
        }

        $this->command->info("Created {$resultCount} results.");
    }

    protected function generateRealisticValue($param): float
    {
        $limits = [
            'PH' => [6.5, 8.5],
            'TURB' => [0.1, 3.0],
            'TEMP' => [18, 25],
            'CL2' => [0.2, 0.8],
            'F' => [0.3, 1.2],
            'NO3' => [1.0, 30.0],
            'ECOLI' => [0, 5],
            'TC' => [0, 10],
        ];

        if (isset($limits[$param->code])) {
            [$min, $max] = $limits[$param->code];
            return round(mt_rand($min * 100, $max * 100) / 100, 2);
        }

        // Default: random value between 0 and limit or 0-10
        $max = $param->who_limit ?? $param->wasreb_limit ?? 10;
        return round(mt_rand(0, $max * 100) / 100, 2);
    }

    protected function generateQcFlags($value, $param): array
    {
        $flags = [];

        if ($param->who_limit !== null && $value > $param->who_limit) {
            $flags[] = 'exceeds_who_limit';
        }

        if ($param->wasreb_limit !== null && $value > $param->wasreb_limit) {
            $flags[] = 'exceeds_wasreb_limit';
        }

        if ($param->local_limit !== null && $value > $param->local_limit) {
            $flags[] = 'exceeds_local_limit';
        }

        return $flags;
    }

    protected function getLOD($param): ?float
    {
        // Typical detection limits
        $lods = [
            'PH' => null,
            'TURB' => 0.1,
            'CL2' => 0.01,
            'NO3' => 0.1,
            'ECOLI' => 1,
            'PB' => 1.0,
            'AS' => 0.5,
        ];

        return $lods[$param->code] ?? null;
    }

    protected function getInstrumentForMethod(?string $method): ?string
    {
        $instruments = [
            'pH meter' => 'Hach HQ40d',
            'Nephelometric' => 'Hach 2100Q',
            'DPD Colorimetric' => 'Hach DR900',
            'Membrane Filtration' => 'Millipore Filtration Unit',
            'AAS' => 'PerkinElmer AAnalyst 400',
            'ICP-MS' => 'Agilent 7900',
        ];

        foreach ($instruments as $methodKey => $instrument) {
            if ($method && str_contains($method, $methodKey)) {
                return $instrument;
            }
        }

        return 'Laboratory Analyzer';
    }
}
