import express, { type Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { registerRoutes } from "./routes";
import { registerCoreRegistryRoutes } from "./routes/core-registry";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// GW4R Phase 1 Mock API Endpoints (before proxy)
let aquiferCounter = 3;
const aquiferStore = [
  { id: 1, name: 'Elwak Aquifer', safeYieldMcm: 15, currentYieldMcm: 12, rechargeRateMcm: 3, riskLevel: 'medium', waterQualityStatus: 'Good', areaKm2: 5000 },
  { id: 2, name: 'Merti Aquifer', safeYieldMcm: 20, currentYieldMcm: 18, rechargeRateMcm: 4, riskLevel: 'low', waterQualityStatus: 'Excellent', areaKm2: 8000 },
  { id: 3, name: 'Neogene Aquifer', safeYieldMcm: 10, currentYieldMcm: 9, rechargeRateMcm: 2, riskLevel: 'high', waterQualityStatus: 'Fair', areaKm2: 3000 },
];

app.get('/api/hydromet/aquifers', (req, res) => {
  res.json({ data: aquiferStore });
});

app.post('/api/hydromet/aquifers', (req, res) => {
  const { name, safeYieldMcm } = req.body;
  if (!name || safeYieldMcm === undefined) {
    return res.status(400).json({ error: 'Name and safeYieldMcm are required' });
  }
  const newAquifer = {
    id: ++aquiferCounter,
    name,
    safeYieldMcm,
    currentYieldMcm: Math.floor(safeYieldMcm * 0.8),
    rechargeRateMcm: Math.floor(safeYieldMcm * 0.25),
    riskLevel: 'low',
    waterQualityStatus: 'Good',
    areaKm2: Math.floor(Math.random() * 10000),
  };
  aquiferStore.push(newAquifer);
  res.json({ data: newAquifer, message: 'Aquifer registered successfully' });
});
app.get('/api/core-ops/droughts', (req, res) => {
  res.json({ data: [
    { id: 1, name: '2025 ASAL Drought - Jan-Mar', status: 'active', severity: 'high', startDate: '2025-01-01', affectedPopulation: 125000, activatedBoreholes: 8, waterRationing: true },
    { id: 2, name: '2024 Oct-Dec Drought', status: 'resolved', severity: 'medium', startDate: '2024-10-01', endDate: '2024-12-15', affectedPopulation: 85000, activatedBoreholes: 5, waterRationing: false },
  ] });
});
app.post('/api/core-ops/droughts', (req, res) => { res.json({ id: 3, status: 'declared', message: 'Drought event declared', ...req.body }); });
app.post('/api/core-ops/droughts/:id/activate', (req, res) => { res.json({ id: req.params.id, status: 'active', message: 'Emergency response activated' }); });
app.get('/api/me/gender-equity', (req, res) => {
  res.json({ data: [
    { id: 1, gender: 'female', count: 450, accessHours: 12, collectionTime: 45, satisfaction: 65 },
    { id: 2, gender: 'male', count: 320, accessHours: 15, collectionTime: 15, satisfaction: 78 },
    { id: 3, gender: 'youth', count: 280, accessHours: 14, collectionTime: 25, satisfaction: 72 },
    { id: 4, gender: 'elderly', count: 95, accessHours: 10, collectionTime: 60, satisfaction: 58 },
  ] });
});
app.get('/api/training/assessments', (req, res) => {
  res.json({ data: [
    { id: 1, operatorId: 'OP-001', operatorName: 'James Kipchoge', topic: 'operation', score: 85, maxScore: 100, status: 'completed', certificationValid: true, validUntil: '2026-01-15' },
    { id: 2, operatorId: 'OP-002', operatorName: 'Mary Nairobi', topic: 'maintenance', score: 92, maxScore: 100, status: 'completed', certificationValid: true, validUntil: '2026-06-10' },
    { id: 3, operatorId: 'OP-003', operatorName: 'Peter Mwangi', topic: 'safety', score: 78, maxScore: 100, status: 'completed', certificationValid: false, validUntil: null },
  ] });
});
app.post('/api/training/assessments', (req, res) => { res.json({ id: 4, status: 'pending', message: 'Assessment recorded', ...req.body }); });

// ============ AUTHENTICATION (Mock) ============
app.get('/api/v1/auth/user', (req, res) => {
  res.json({ 
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    tenant_id: 1,
    permissions: ['*'],
    authenticated: true
  });
});

// ============ CRM MODULE (Mock) ============
app.get('/api/v1/crm/customers', (req, res) => {
  res.json({ data: [
    { id: 1, tenant_id: 1, first_name: 'John', last_name: 'Mwangi', id_number: 'ID-001', phone: '+254712345678', email: 'john@example.com', customer_type: 'residential', created_at: '2024-01-15', updated_at: '2024-11-20', service_connections: [{ id: 1, account_no: 'ACC-001', status: 'active' }] },
    { id: 2, tenant_id: 1, first_name: 'Mary', last_name: 'Wanjiku', id_number: 'ID-002', phone: '+254723456789', email: 'mary@example.com', customer_type: 'commercial', created_at: '2024-02-10', updated_at: '2024-11-18', service_connections: [{ id: 2, account_no: 'ACC-002', status: 'active' }] },
    { id: 3, tenant_id: 1, first_name: 'Peter', last_name: 'Ochieng', id_number: 'ID-003', phone: '+254734567890', email: 'peter@example.com', customer_type: 'industrial', created_at: '2024-03-05', updated_at: '2024-11-15', service_connections: [{ id: 3, account_no: 'ACC-003', status: 'active' }] },
    { id: 4, tenant_id: 1, first_name: 'Grace', last_name: 'Akinyi', id_number: 'ID-004', phone: '+254745678901', email: 'grace@example.com', customer_type: 'residential', created_at: '2024-04-20', updated_at: '2024-11-10', service_connections: [{ id: 4, account_no: 'ACC-004', status: 'suspended' }] },
    { id: 5, tenant_id: 1, first_name: 'Nairobi City', last_name: 'Council', id_number: 'ID-005', phone: '+254756789012', email: 'council@nairobi.go.ke', customer_type: 'public', created_at: '2024-05-01', updated_at: '2024-11-05', service_connections: [{ id: 5, account_no: 'ACC-005', status: 'active' }] },
  ], meta: { total: 5, per_page: 50, current_page: 1 } });
});

app.get('/api/v1/crm/complaints', (req, res) => {
  res.json({ data: [
    { id: 1, tenant_id: 1, customer_id: 1, account_no: 'ACC-001', category: 'billing', priority: 'medium', status: 'open', description: 'Overcharged on last bill', created_at: '2024-11-20', updated_at: '2024-11-20' },
    { id: 2, tenant_id: 1, customer_id: 2, account_no: 'ACC-002', category: 'water_quality', priority: 'high', status: 'triage', description: 'Brown water from tap', created_at: '2024-11-19', updated_at: '2024-11-20' },
    { id: 3, tenant_id: 1, customer_id: 3, account_no: 'ACC-003', category: 'supply', priority: 'critical', status: 'field', description: 'No water for 3 days', created_at: '2024-11-18', updated_at: '2024-11-19' },
  ], meta: { total: 3, per_page: 50, current_page: 1 } });
});

app.get('/api/v1/crm/interactions', (req, res) => {
  res.json({ data: [
    { id: 1, tenant_id: 1, customer_id: 1, account_no: 'ACC-001', channel: 'phone', subject: 'Billing inquiry', message: 'Customer called about bill discrepancy', status: 'resolved', created_by: 1, created_at: '2024-11-20' },
    { id: 2, tenant_id: 1, customer_id: 2, account_no: 'ACC-002', channel: 'walk_in', subject: 'New connection request', message: 'Customer visited office for new meter', status: 'pending', created_by: 1, created_at: '2024-11-19' },
  ], meta: { total: 2, per_page: 50, current_page: 1 } });
});

app.get('/api/v1/crm/ra/cases', (req, res) => {
  res.json({ data: [
    { id: 1, account_no: 'ACC-001', rule_id: 1, status: 'new', priority: 'high', detected_at: '2024-11-20', evidence: { consumption_spike: 250 } },
    { id: 2, account_no: 'ACC-003', rule_id: 2, status: 'triage', priority: 'medium', detected_at: '2024-11-18', evidence: { meter_tampering: true } },
  ], meta: { total: 2, per_page: 50, current_page: 1 } });
});

app.get('/api/v1/crm/ra/cases/high-priority', (req, res) => {
  res.json({ data: [
    { id: 1, account_no: 'ACC-001', rule_id: 1, status: 'new', priority: 'high', detected_at: '2024-11-20', evidence: { consumption_spike: 250 } },
  ] });
});

app.get('/api/v1/crm/dunning/disconnection-list', (req, res) => {
  res.json([
    { account_no: 'ACC-004', customer_name: 'Grace Akinyi', balance: 15000, days_overdue: 95, last_payment_date: '2024-08-15' },
    { account_no: 'ACC-007', customer_name: 'David Mutua', balance: 22500, days_overdue: 120, last_payment_date: '2024-07-20' },
    { account_no: 'ACC-012', customer_name: 'Faith Njoki', balance: 8700, days_overdue: 105, last_payment_date: null },
  ]);
});

app.get('/api/v1/crm/dunning/aging', (req, res) => {
  res.json({ summary: { total_accounts: 5, total_balance: 125000, current: 25000, days_30: 35000, days_60: 30000, days_90: 20000, over_90: 15000 }, by_category: { residential: 45000, commercial: 35000, industrial: 30000, public: 15000 } });
});

app.get('/api/v1/crm/tariffs', (req, res) => {
  res.json({ data: [
    { id: 1, name: 'Residential Standard', category: 'residential', base_rate: 50, per_unit_rate: 85, effective_from: '2024-01-01' },
    { id: 2, name: 'Commercial Standard', category: 'commercial', base_rate: 150, per_unit_rate: 120, effective_from: '2024-01-01' },
    { id: 3, name: 'Industrial Standard', category: 'industrial', base_rate: 500, per_unit_rate: 95, effective_from: '2024-01-01' },
  ] });
});

app.get('/api/v1/crm/billing/runs', (req, res) => {
  res.json({ data: [
    { id: 1, period: '2024-11', status: 'completed', total_invoices: 450, total_amount: 2500000, created_at: '2024-11-01' },
    { id: 2, period: '2024-10', status: 'completed', total_invoices: 445, total_amount: 2350000, created_at: '2024-10-01' },
  ] });
});

app.get('/api/v1/crm/reconciliation/aging', (req, res) => {
  res.json({ summary: { total_accounts: 450, total_outstanding: 3500000, current: 1200000, days_30: 950000, days_60: 650000, days_90: 400000, over_90: 300000 } });
});

app.get('/api/v1/crm/reconciliation/payments', (req, res) => {
  res.json({ data: [
    { id: 1, account_no: 'ACC-001', amount: 5000, payment_date: '2024-11-20', method: 'mpesa', reference: 'MPE123456' },
    { id: 2, account_no: 'ACC-002', amount: 12000, payment_date: '2024-11-19', method: 'bank', reference: 'BNK789012' },
  ] });
});

app.get('/api/v1/crm/meter-routes', (req, res) => {
  res.json({ data: [
    { id: 1, name: 'Route A - Central', zone_id: 1, meter_count: 120, status: 'active' },
    { id: 2, name: 'Route B - Industrial', zone_id: 2, meter_count: 45, status: 'active' },
  ] });
});

app.get('/api/v1/crm/kiosks', (req, res) => {
  res.json({ data: [
    { id: 1, name: 'Kibera Kiosk 1', location: 'Kibera Silanga', status: 'operational', daily_sales: 5000, water_price: 5 },
    { id: 2, name: 'Mathare Kiosk', location: 'Mathare 4A', status: 'operational', daily_sales: 3500, water_price: 5 },
  ] });
});

app.get('/api/v1/crm/kiosks/trucks', (req, res) => {
  res.json({ data: [
    { id: 1, registration: 'KBZ 123A', capacity: 10000, status: 'active', trips_today: 5 },
    { id: 2, registration: 'KCA 456B', capacity: 15000, status: 'maintenance', trips_today: 0 },
  ] });
});

app.get('/api/v1/crm/connections/applications', (req, res) => {
  res.json({ data: [
    { id: 1, applicant_name: 'James Kamau', phone: '+254711222333', address: '123 Westlands', status: 'pending', applied_at: '2024-11-18' },
    { id: 2, applicant_name: 'Sarah Njeri', phone: '+254722333444', address: '456 Kilimani', status: 'approved', applied_at: '2024-11-15' },
  ] });
});

// ============ COSTING MODULE (Mock) ============
app.get('/api/v1/costing/budgets', (req, res) => {
  res.json({ data: [
    { id: 1, name: 'FY 2025 Operations Budget', fiscal_year: 2025, status: 'approved', total_amount: 125000000, created_at: '2024-10-01' },
    { id: 2, name: 'FY 2025 Capital Budget', fiscal_year: 2025, status: 'draft', total_amount: 85000000, created_at: '2024-11-01' },
    { id: 3, name: 'FY 2024 Operations Budget', fiscal_year: 2024, status: 'archived', total_amount: 110000000, created_at: '2023-10-01' },
  ] });
});

app.get('/api/v1/costing/allocation-rules', (req, res) => {
  res.json({ data: [
    { id: 1, name: 'Energy Cost Allocation', type: 'proportional', basis: 'consumption', status: 'active' },
    { id: 2, name: 'Maintenance Cost Allocation', type: 'fixed', basis: 'asset_value', status: 'active' },
  ] });
});

app.get('/api/v1/costing/allocation-runs', (req, res) => {
  res.json({ data: [
    { id: 1, period: '2024-11', status: 'completed', total_allocated: 15000000, run_at: '2024-11-15' },
  ] });
});

app.get('/api/v1/costing/cost-to-serve', (req, res) => {
  res.json({ data: [
    { dma_id: 1, dma_name: 'DMA Central', cost_per_m3: 45.50, total_cost: 2500000, volume_m3: 55000 },
    { dma_id: 2, dma_name: 'DMA Industrial', cost_per_m3: 38.20, total_cost: 1850000, volume_m3: 48500 },
  ] });
});

app.get('/api/v1/costing/cost-to-serve/summary', (req, res) => {
  res.json({ total_cost: 4350000, total_volume: 103500, average_cost_per_m3: 42.03, period_from: '2025-01', period_to: '2025-01' });
});

app.get('/api/v1/costing/cost-to-serve/dma-league/:period', (req, res) => {
  res.json({ data: [
    { rank: 1, dma_name: 'DMA Industrial', cost_per_m3: 38.20 },
    { rank: 2, dma_name: 'DMA Central', cost_per_m3: 45.50 },
  ] });
});

// ============ PHASE 3: PREDICTIVE ANALYTICS ============
app.get('/api/core-ops/predictions/asset-failures', (req, res) => {
  res.json({
    data: [
      { assetId: 'pump_001', failureProbability: 87, daysToFailure: 8, confidence: 0.92, riskLevel: 'high', recommendedAction: 'schedule_maintenance_today' },
      { assetId: 'pump_003', failureProbability: 62, daysToFailure: 21, confidence: 0.85, riskLevel: 'medium', recommendedAction: 'monitor_closely' },
    ]
  });
});

app.get('/api/core-ops/predictions/nrw-anomalies', (req, res) => {
  res.json({
    data: [
      { dmaId: 'dma_001', nrwPercentage: 35.2, baselineNrw: 28.5, anomalyScore: 0.87, leakDetected: true, estimatedLossMc: 450, estimatedCostPerDay: 2250, urgency: 'high' },
    ]
  });
});

app.get('/api/core-ops/predictions/demand-forecast/:schemeId', (req, res) => {
  res.json({
    data: [
      { date: '2025-12-01', demand: 1200, lower: 1050, upper: 1350 },
      { date: '2025-12-02', demand: 1350, lower: 1180, upper: 1520 },
      { date: '2025-12-03', demand: 1100, lower: 950, upper: 1250 },
    ]
  });
});

app.get('/api/core-ops/predictions/pump-schedule', (req, res) => {
  res.json({
    data: [
      { pumpId: 'pump_001', startTime: '22:00', endTime: '04:00', reason: 'off_peak_tariff', estimatedCost: 450 },
      { pumpId: 'pump_002', startTime: '08:00', endTime: '10:00', reason: 'peak_demand', estimatedCost: 180 },
    ]
  });
});

app.get('/api/core-ops/predictions/outage-impact', (req, res) => {
  res.json({
    affectedConnections: 1240,
    affectedPopulation: 6200,
    impactScore: 72,
    suggestedTiming: '2025-12-22 midnight (Sunday, lower demand)',
  });
});

app.get('/api/core-ops/nrw/snapshots/:dmaId', (req, res) => {
  res.json({
    data: [
      { date: '2025-11-24', nrw: 28.5, systemInput: 15000, billed: 10725, loss: 4275 },
      { date: '2025-11-23', nrw: 27.2, systemInput: 14800, billed: 10778, loss: 4022 },
    ]
  });
});

app.get('/api/core-ops/interventions/:dmaId', (req, res) => {
  res.json({
    data: [
      { id: '1', type: 'leak_detection', status: 'completed', startDate: '2025-11-01', endDate: '2025-11-20', cost: 125000, nrwReduction: 8 },
      { id: '2', type: 'meter_audit', status: 'ongoing', startDate: '2025-11-15', estimatedCost: 85000 },
    ]
  });
});

// ============ PHASE 1-2: CORE REGISTRY & OPERATIONS ROUTES ============
registerCoreRegistryRoutes(app);

app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/'
  },
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      log(`[Proxy] ${req.method} ${req.url} → Laravel`);
    },
    proxyRes: (proxyRes: any, req: any) => {
      log(`[Proxy] ✓ ${proxyRes.statusCode}`);
    },
    error: (err: any, req: any, res: any) => {
      log(`[Proxy Error] ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Laravel API unavailable', 
          message: 'Start Laravel: cd api && php artisan serve --host=0.0.0.0 --port=8000',
          details: err.message
        }));
      }
    }
  }
}) as any);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

// Register Phase 1-2 routes (core-registry must be after predictions but before proxy)
// This will be inserted during app startup
