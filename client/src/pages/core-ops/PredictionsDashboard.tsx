import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

type TabType = 'assets' | 'nrw' | 'demand' | 'schedule' | 'outage';

interface AssetRisk {
  assetId: string;
  failureProbability: number;
  daysToFailure: number;
  confidence: number;
  riskLevel: string;
  recommendedAction: string;
}

interface NrwAnomaly {
  dmaId: string;
  nrwPercentage: number;
  baselineNrw: number;
  anomalyScore: number;
  leakDetected: boolean;
  estimatedLossMc: number;
  estimatedCostPerDay: number;
  urgency: string;
}

interface DemandForecast {
  date: string;
  demand: number;
  lower: number;
  upper: number;
}

interface PumpSchedule {
  pumpId: string;
  startTime: string;
  endTime: string;
  reason: string;
  estimatedCost: number;
}

interface OutageImpact {
  affectedConnections: number;
  affectedPopulation: number;
  impactScore: number;
  suggestedTiming: string;
}

export function PredictionsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('assets');

  // Mock data - will be replaced with API calls
  const assetRisks: AssetRisk[] = [
    {
      assetId: 'pump_001',
      failureProbability: 87,
      daysToFailure: 8,
      confidence: 0.92,
      riskLevel: 'high',
      recommendedAction: 'schedule_maintenance_today',
    },
    {
      assetId: 'pump_003',
      failureProbability: 62,
      daysToFailure: 21,
      confidence: 0.85,
      riskLevel: 'medium',
      recommendedAction: 'monitor_closely',
    },
    {
      assetId: 'motor_005',
      failureProbability: 45,
      daysToFailure: 35,
      confidence: 0.78,
      riskLevel: 'medium',
      recommendedAction: 'plan_maintenance_next_month',
    },
  ];

  const nrwAnomalies: NrwAnomaly[] = [
    {
      dmaId: 'dma_001',
      nrwPercentage: 35.2,
      baselineNrw: 28.5,
      anomalyScore: 0.87,
      leakDetected: true,
      estimatedLossMc: 450,
      estimatedCostPerDay: 2250,
      urgency: 'high',
    },
  ];

  const demandForecasts: DemandForecast[] = [
    { date: '2025-12-01', demand: 1200, lower: 1050, upper: 1350 },
    { date: '2025-12-02', demand: 1350, lower: 1180, upper: 1520 },
    { date: '2025-12-03', demand: 1100, lower: 950, upper: 1250 },
    { date: '2025-12-04', demand: 1280, lower: 1120, upper: 1440 },
  ];

  const pumpSchedules: PumpSchedule[] = [
    {
      pumpId: 'pump_001',
      startTime: '22:00',
      endTime: '04:00',
      reason: 'off_peak_tariff',
      estimatedCost: 450,
    },
    {
      pumpId: 'pump_002',
      startTime: '08:00',
      endTime: '10:00',
      reason: 'peak_demand',
      estimatedCost: 180,
    },
  ];

  const outageImpact: OutageImpact = {
    affectedConnections: 1240,
    affectedPopulation: 6200,
    impactScore: 72,
    suggestedTiming: '2025-12-22 midnight (Sunday, lower demand)',
  };

  const getRiskColor = (probability: number) => {
    if (probability >= 80) return 'text-red-600 bg-red-50';
    if (probability >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights for proactive operations management
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assets">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Asset Health
          </TabsTrigger>
          <TabsTrigger value="nrw">
            <AlertCircle className="w-4 h-4 mr-2" />
            NRW Anomalies
          </TabsTrigger>
          <TabsTrigger value="demand">
            <TrendingUp className="w-4 h-4 mr-2" />
            Demand
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Zap className="w-4 h-4 mr-2" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="outage">
            <AlertCircle className="w-4 h-4 mr-2" />
            Outage Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Failure Predictions</CardTitle>
              <CardDescription>
                Predicted pump and equipment failures based on telemetry patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assetRisks.map((risk) => (
                  <div
                    key={risk.assetId}
                    className={`p-4 rounded-lg border ${getRiskColor(risk.failureProbability)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{risk.assetId}</h3>
                        <p className="text-sm opacity-75">
                          {risk.daysToFailure} days to likely failure
                        </p>
                      </div>
                      <span className="text-xl font-bold">{risk.failureProbability}%</span>
                    </div>
                    <p className="text-sm mb-2">
                      <span className="font-medium">Action:</span> {risk.recommendedAction}
                    </p>
                    <p className="text-xs opacity-75">
                      Confidence: {Math.round(risk.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nrw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NRW Anomaly Detection</CardTitle>
              <CardDescription>
                Detected unusual water loss patterns indicating potential leaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nrwAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.dmaId}
                    className={`p-4 rounded-lg border ${getSeverityColor(anomaly.urgency)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{anomaly.dmaId}</h3>
                        <p className="text-sm opacity-75">Leak Detected</p>
                      </div>
                      <span className="text-lg font-bold">
                        {anomaly.nrwPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <p className="opacity-75">Baseline NRW</p>
                        <p className="font-medium">{anomaly.baselineNrw.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="opacity-75">Loss/Day</p>
                        <p className="font-medium">{anomaly.estimatedLossMc} m³</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      Cost: KES {anomaly.estimatedCostPerDay.toLocaleString()}/day
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Demand Forecast</CardTitle>
              <CardDescription>
                Predicted water consumption with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demandForecasts.map((forecast) => (
                  <div key={forecast.date} className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{forecast.date}</h3>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{forecast.demand} m³</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full relative">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${((forecast.demand - forecast.lower) / (forecast.upper - forecast.lower)) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs opacity-75 mt-1">
                      Range: {forecast.lower} - {forecast.upper} m³
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pump Schedule Optimizer</CardTitle>
              <CardDescription>
                Recommended pump operation times to minimize energy costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pumpSchedules.map((schedule) => (
                  <div key={schedule.pumpId} className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{schedule.pumpId}</h3>
                        <p className="text-sm opacity-75">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-green-600">KES {schedule.estimatedCost}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Reason:</span> {schedule.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outage Impact Prediction</CardTitle>
              <CardDescription>
                Predicted customer impact from scheduled outages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Current Outage Plan</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm opacity-75">Affected Connections</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {outageImpact.affectedConnections.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-75">Affected Population</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {outageImpact.affectedPopulation.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm opacity-75">Impact Score</p>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${outageImpact.impactScore}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium mt-1">{outageImpact.impactScore} / 100</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-orange-300">
                    <p className="text-sm opacity-75">Suggested Alternative Timing</p>
                    <p className="font-semibold text-gray-900">{outageImpact.suggestedTiming}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
