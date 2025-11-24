import { Router } from 'express';

export function registerCoreRegistryRoutes(app: any) {
  // ============ SCHEMES ============
  app.get('/api/core/schemes', (req, res) => {
    res.json({
      data: [
        { id: 1, code: 'KISII_001', name: 'Kisii Urban Scheme', type: 'piped', status: 'active', county: 'Kisii', populationServed: 45000, connections: 8900 },
        { id: 2, code: 'KERICHO_001', name: 'Kericho Town Scheme', type: 'piped', status: 'active', county: 'Kericho', populationServed: 32000, connections: 6200 },
      ],
      total: 2
    });
  });

  app.post('/api/core/schemes', (req, res) => {
    res.json({ id: 3, message: 'Scheme created', ...req.body });
  });

  app.get('/api/core/schemes/:id', (req, res) => {
    res.json({ id: req.params.id, code: 'KISII_001', name: 'Kisii Urban Scheme', type: 'piped', status: 'active' });
  });

  // ============ DMAs ============
  app.get('/api/core/dmas', (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, code: 'KISII_DMA_01', name: 'Central Kisii DMA', status: 'active' },
        { id: 2, schemeId: 1, code: 'KISII_DMA_02', name: 'South Kisii DMA', status: 'active' },
      ],
      total: 2
    });
  });

  app.post('/api/core/dmas', (req, res) => {
    res.json({ id: 3, message: 'DMA created', ...req.body });
  });

  // ============ ASSETS ============
  app.get('/api/core/assets', (req, res) => {
    res.json({
      data: [
        { id: 1, code: 'PUMP_001', name: 'Main Pump', type: 'pump', status: 'operational', condition: 'good' },
        { id: 2, code: 'PIPE_001', name: 'Primary Pipeline', type: 'pipe', status: 'operational', condition: 'fair' },
        { id: 3, code: 'RES_001', name: 'Main Reservoir', type: 'reservoir', status: 'operational', condition: 'good' },
      ],
      total: 3
    });
  });

  app.post('/api/core/assets', (req, res) => {
    res.json({ id: 4, message: 'Asset created', ...req.body });
  });

  app.get('/api/core/assets/:id', (req, res) => {
    res.json({ id: req.params.id, code: 'PUMP_001', name: 'Main Pump', type: 'pump', status: 'operational' });
  });

  // ============ METERS ============
  app.get('/api/core/meters', (req, res) => {
    res.json({
      data: [
        { id: 1, serialNumber: 'KM-001-2024', meterType: 'bulk', status: 'active', lastReading: 125000 },
        { id: 2, serialNumber: 'KM-002-2024', meterType: 'consumer', status: 'active', lastReading: 45300 },
      ],
      total: 2
    });
  });

  // ============ TELEMETRY TAGS ============
  app.get('/api/core/telemetry/tags', (req, res) => {
    res.json({
      data: [
        { id: 1, tag: 'PUMP_001_FLOW', ioType: 'AI', unit: 'lpm', scale: { min: 0, max: 500 } },
        { id: 2, tag: 'RES_001_LEVEL', ioType: 'AI', unit: 'm3', scale: { min: 0, max: 1000 } },
        { id: 3, tag: 'PUMP_001_STATUS', ioType: 'DI', unit: 'on/off' },
      ],
      total: 3
    });
  });

  app.post('/api/core/telemetry/tags', (req, res) => {
    res.json({ id: 4, message: 'Telemetry tag created', ...req.body });
  });

  // ============ TELEMETRY MEASUREMENTS ============
  app.get('/api/core/telemetry/measurements', (req, res) => {
    res.json({
      data: [
        { id: 1, tag: 'PUMP_001_FLOW', timestamp: '2025-11-24T14:30:00Z', value: '245' },
        { id: 2, tag: 'RES_001_LEVEL', timestamp: '2025-11-24T14:30:00Z', value: '750' },
        { id: 3, tag: 'PUMP_001_STATUS', timestamp: '2025-11-24T14:30:00Z', value: 'on' },
      ]
    });
  });

  app.post('/api/core/telemetry/measurements', (req, res) => {
    res.json({ id: 4, message: 'Measurement recorded', ...req.body });
  });

  // ============ PUMP SCHEDULES ============
  app.get('/api/core/schedules', (req, res) => {
    res.json({
      data: [
        { id: 1, assetId: 1, startTime: '2025-12-01T06:00:00Z', endTime: '2025-12-01T12:00:00Z', status: 'scheduled' },
        { id: 2, assetId: 1, startTime: '2025-12-01T18:00:00Z', endTime: '2025-12-02T00:00:00Z', status: 'scheduled' },
      ],
      total: 2
    });
  });

  app.post('/api/core/schedules', (req, res) => {
    res.json({ id: 3, message: 'Schedule created', ...req.body });
  });

  // ============ OUTAGES ============
  app.get('/api/core/outages', (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, cause: 'planned', state: 'draft', reason: 'Pump maintenance', estimatedAffectedPopulation: 8900 },
        { id: 2, schemeId: 1, cause: 'fault', state: 'live', reason: 'Power outage', estimatedAffectedPopulation: 4500 },
      ],
      total: 2
    });
  });

  app.post('/api/core/outages', (req, res) => {
    res.json({ id: 3, message: 'Outage created', ...req.body });
  });

  app.patch('/api/core/outages/:id', (req, res) => {
    res.json({ id: req.params.id, message: 'Outage updated', ...req.body });
  });

  // ============ DOSING CONTROL ============
  app.get('/api/core/dosing/plans', (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, assetId: 1, status: 'active', flowBands: [{ min_lps: 0, max_lps: 100, target_mg_l: 0.5 }] },
      ],
      total: 1
    });
  });

  app.post('/api/core/dosing/plans', (req, res) => {
    res.json({ id: 2, message: 'Dosing plan created', ...req.body });
  });

  app.get('/api/core/chemical-stocks', (req, res) => {
    res.json({
      data: [
        { id: 1, schemeId: 1, chemical: 'chlorine', quantityL: 500, supplier: 'ChemTrade', expiryDate: '2026-06-30' },
      ],
      total: 1
    });
  });

  // ============ PRESSURE & LEAK REPORTS ============
  app.get('/api/core/pressure-leak-reports', (req, res) => {
    res.json({
      data: [
        { id: 1, dmaId: 1, reportType: 'leak_detected', severity: 'high', location: 'Nyamira Road', status: 'open' },
      ],
      total: 1
    });
  });

  app.post('/api/core/pressure-leak-reports', (req, res) => {
    res.json({ id: 2, message: 'Report created', ...req.body });
  });
}
