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

// ============ PROJECTS & CAPITAL MODULE (Mock) ============
let projectCounter = 5;
const projectsStore = [
  { id: '1', tenant_id: '1', code: 'PRJ-2024-001', title: 'Nairobi Water Pipeline Extension', description: 'Extension of main pipeline to serve new residential area', program_id: '1', category_id: '1', pipeline_id: null, pm_id: '1', baseline_budget: 15000000, revised_budget: 16500000, baseline_start_date: '2024-06-01', baseline_end_date: '2025-06-01', revised_start_date: '2024-07-01', revised_end_date: '2025-08-01', actual_start_date: '2024-07-15', actual_end_date: null, physical_progress: 45, financial_progress: 38, status: 'execution', location: null, created_by: '1', meta: null, created_at: '2024-05-15', updated_at: '2024-11-20' },
  { id: '2', tenant_id: '1', code: 'PRJ-2024-002', title: 'Mombasa Treatment Plant Upgrade', description: 'Upgrade water treatment capacity from 50ML to 80ML per day', program_id: '1', category_id: '2', pipeline_id: null, pm_id: '2', baseline_budget: 85000000, revised_budget: null, baseline_start_date: '2024-09-01', baseline_end_date: '2026-03-01', revised_start_date: null, revised_end_date: null, actual_start_date: '2024-09-15', actual_end_date: null, physical_progress: 22, financial_progress: 18, status: 'execution', location: null, created_by: '1', meta: null, created_at: '2024-08-01', updated_at: '2024-11-18' },
  { id: '3', tenant_id: '1', code: 'PRJ-2024-003', title: 'Kisumu DMA Establishment', description: 'Create 5 new District Metered Areas for NRW reduction', program_id: '2', category_id: '3', pipeline_id: null, pm_id: '1', baseline_budget: 8500000, revised_budget: null, baseline_start_date: '2024-10-01', baseline_end_date: '2025-02-28', revised_start_date: null, revised_end_date: null, actual_start_date: null, actual_end_date: null, physical_progress: 0, financial_progress: 0, status: 'tendering', location: null, created_by: '1', meta: null, created_at: '2024-09-15', updated_at: '2024-11-15' },
  { id: '4', tenant_id: '1', code: 'PRJ-2023-015', title: 'Nakuru Reservoir Construction', description: 'New 5000m3 service reservoir', program_id: '1', category_id: '1', pipeline_id: null, pm_id: '3', baseline_budget: 45000000, revised_budget: 48000000, baseline_start_date: '2023-03-01', baseline_end_date: '2024-09-01', revised_start_date: '2023-03-01', revised_end_date: '2024-11-30', actual_start_date: '2023-03-15', actual_end_date: null, physical_progress: 92, financial_progress: 88, status: 'execution', location: null, created_by: '1', meta: null, created_at: '2023-01-10', updated_at: '2024-11-20' },
  { id: '5', tenant_id: '1', code: 'PRJ-2023-008', title: 'Eldoret Meter Replacement Program', description: 'Replace 2500 old meters with smart AMI meters', program_id: '2', category_id: '4', pipeline_id: null, pm_id: '2', baseline_budget: 12000000, revised_budget: null, baseline_start_date: '2023-06-01', baseline_end_date: '2024-06-01', revised_start_date: null, revised_end_date: null, actual_start_date: '2023-06-15', actual_end_date: '2024-07-30', physical_progress: 100, financial_progress: 98, status: 'completed', location: null, created_by: '1', meta: null, created_at: '2023-04-20', updated_at: '2024-08-01' },
];

app.get('/api/v1/projects', (req, res) => {
  res.json({ data: projectsStore });
});

app.get('/api/v1/projects/dashboard', (req, res) => {
  const active = projectsStore.filter(p => p.status === 'execution').length;
  const totalBudget = projectsStore.reduce((sum, p) => sum + p.baseline_budget, 0);
  const avgPhysical = Math.round(projectsStore.reduce((sum, p) => sum + p.physical_progress, 0) / projectsStore.length);
  const avgFinancial = Math.round(projectsStore.reduce((sum, p) => sum + p.financial_progress, 0) / projectsStore.length);
  res.json({ data: {
    active_projects: active,
    total_budget: totalBudget,
    avg_physical_progress: avgPhysical,
    avg_financial_progress: avgFinancial,
    delayed_projects: 2,
    dlp_count: 1,
    pending_claims: 3
  }});
});

app.get('/api/v1/projects/:id', (req, res) => {
  const project = projectsStore.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ data: project });
});

app.post('/api/v1/projects', (req, res) => {
  const { title, description, baseline_budget, baseline_start_date, baseline_end_date, program_id, category_id } = req.body;
  if (!title || !baseline_budget) return res.status(400).json({ error: 'Title and budget required' });
  const newProject = {
    id: String(++projectCounter),
    tenant_id: '1',
    code: `PRJ-2024-${String(projectCounter).padStart(3, '0')}`,
    title,
    description: description || null,
    program_id: program_id || null,
    category_id: category_id || null,
    pipeline_id: null,
    pm_id: null,
    baseline_budget,
    revised_budget: null,
    baseline_start_date: baseline_start_date || null,
    baseline_end_date: baseline_end_date || null,
    revised_start_date: null,
    revised_end_date: null,
    actual_start_date: null,
    actual_end_date: null,
    physical_progress: 0,
    financial_progress: 0,
    status: 'planning',
    location: null,
    created_by: '1',
    meta: null,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  };
  projectsStore.push(newProject);
  res.json({ data: newProject, message: 'Project created successfully' });
});

app.patch('/api/v1/projects/:id', (req, res) => {
  const idx = projectsStore.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  projectsStore[idx] = { ...projectsStore[idx], ...req.body, updated_at: new Date().toISOString().split('T')[0] };
  res.json({ data: projectsStore[idx] });
});

app.delete('/api/v1/projects/:id', (req, res) => {
  const idx = projectsStore.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  projectsStore.splice(idx, 1);
  res.json({ message: 'Project deleted' });
});

// Investment Pipelines
let pipelineCounter = 4;
const pipelinesStore = [
  { id: '1', tenant_id: '1', code: 'INV-2024-001', title: 'Thika Road Trunk Main', description: 'New 900mm trunk main along Thika Road', program_id: '1', category_id: '1', estimated_cost: 250000000, currency: 'KES', connections_added: 15000, energy_savings: null, nrw_reduction: 8, revenue_increase: 45000000, bcr: 2.4, npv: 180000000, irr: 18.5, risk_reduction_score: 75, priority_score: 88, status: 'approved', location: null, created_by: '1', approved_by: '2', approved_at: '2024-10-15', meta: null, created_at: '2024-06-01', updated_at: '2024-10-15' },
  { id: '2', tenant_id: '1', code: 'INV-2024-002', title: 'Solar Pumping Stations', description: 'Convert 12 pumping stations to solar power', program_id: '2', category_id: '2', estimated_cost: 85000000, currency: 'KES', connections_added: null, energy_savings: 35, nrw_reduction: null, revenue_increase: 12000000, bcr: 1.8, npv: 45000000, irr: 15.2, risk_reduction_score: 60, priority_score: 72, status: 'shortlisted', location: null, created_by: '1', approved_by: null, approved_at: null, meta: null, created_at: '2024-07-15', updated_at: '2024-11-01' },
  { id: '3', tenant_id: '1', code: 'INV-2024-003', title: 'Smart Meter Rollout Phase 2', description: 'Deploy 50,000 smart meters in urban areas', program_id: '2', category_id: '4', estimated_cost: 125000000, currency: 'KES', connections_added: null, energy_savings: null, nrw_reduction: 12, revenue_increase: 80000000, bcr: 2.1, npv: 95000000, irr: 22.3, risk_reduction_score: 85, priority_score: 91, status: 'active', location: null, created_by: '1', approved_by: null, approved_at: null, meta: null, created_at: '2024-08-20', updated_at: '2024-11-18' },
  { id: '4', tenant_id: '1', code: 'INV-2024-004', title: 'Borehole Rehabilitation Program', description: 'Rehabilitate 25 boreholes in ASAL counties', program_id: '3', category_id: '3', estimated_cost: 45000000, currency: 'KES', connections_added: 8000, energy_savings: 10, nrw_reduction: null, revenue_increase: 15000000, bcr: 1.5, npv: 12000000, irr: 12.8, risk_reduction_score: 90, priority_score: 78, status: 'active', location: null, created_by: '1', approved_by: null, approved_at: null, meta: null, created_at: '2024-09-10', updated_at: '2024-11-15' },
];

app.get('/api/v1/investments', (req, res) => {
  res.json({ data: pipelinesStore });
});

app.get('/api/v1/investments/:id', (req, res) => {
  const pipeline = pipelinesStore.find(p => p.id === req.params.id);
  if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });
  res.json({ data: pipeline });
});

app.post('/api/v1/investments', (req, res) => {
  const { title, description, estimated_cost, program_id, category_id } = req.body;
  if (!title || !estimated_cost) return res.status(400).json({ error: 'Title and estimated cost required' });
  const newPipeline = {
    id: String(++pipelineCounter),
    tenant_id: '1',
    code: `INV-2024-${String(pipelineCounter).padStart(3, '0')}`,
    title,
    description: description || null,
    program_id: program_id || null,
    category_id: category_id || null,
    estimated_cost,
    currency: 'KES',
    connections_added: null,
    energy_savings: null,
    nrw_reduction: null,
    revenue_increase: null,
    bcr: null,
    npv: null,
    irr: null,
    risk_reduction_score: null,
    priority_score: null,
    status: 'active',
    location: null,
    created_by: '1',
    approved_by: null,
    approved_at: null,
    meta: null,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  };
  pipelinesStore.push(newPipeline);
  res.json({ data: newPipeline, message: 'Investment pipeline created' });
});

app.post('/api/v1/investments/:id/score', (req, res) => {
  const { criterion_id, raw_score, weighted_score, rationale } = req.body;
  res.json({ data: { id: Date.now().toString(), pipeline_id: req.params.id, criterion_id, raw_score, weighted_score, rationale, scored_by: '1', created_at: new Date().toISOString() } });
});

app.get('/api/v1/investments/:id/scores', (req, res) => {
  res.json({ data: [
    { id: '1', pipeline_id: req.params.id, criterion_id: 'financial', raw_score: 85, weighted_score: 25.5, rationale: 'Strong BCR and NPV', scored_by: '1', created_at: '2024-11-01' },
    { id: '2', pipeline_id: req.params.id, criterion_id: 'service', raw_score: 78, weighted_score: 19.5, rationale: 'Good coverage expansion', scored_by: '1', created_at: '2024-11-01' },
    { id: '3', pipeline_id: req.params.id, criterion_id: 'risk', raw_score: 72, weighted_score: 14.4, rationale: 'Moderate technical risk', scored_by: '1', created_at: '2024-11-01' },
  ] });
});

app.post('/api/v1/investments/:id/appraisal', (req, res) => {
  const { capex, opex_annual, project_life_years, discount_rate, recommendation } = req.body;
  const npv = capex * 0.8;
  const bcr = 1.5 + Math.random();
  const irr = 12 + Math.random() * 10;
  res.json({ data: { id: Date.now().toString(), pipeline_id: req.params.id, appraisal_no: `APR-${Date.now()}`, capex, opex_annual, project_life_years, discount_rate, calculated_npv: npv, calculated_bcr: bcr.toFixed(2), calculated_irr: irr.toFixed(1), recommendation, created_at: new Date().toISOString() } });
});

app.post('/api/v1/investments/:id/convert', (req, res) => {
  const pipeline = pipelinesStore.find(p => p.id === req.params.id);
  if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });
  const newProject = {
    id: String(++projectCounter),
    tenant_id: '1',
    code: `PRJ-2024-${String(projectCounter).padStart(3, '0')}`,
    title: pipeline.title,
    description: pipeline.description,
    program_id: pipeline.program_id,
    category_id: pipeline.category_id,
    pipeline_id: pipeline.id,
    pm_id: null,
    baseline_budget: pipeline.estimated_cost,
    revised_budget: null,
    baseline_start_date: null,
    baseline_end_date: null,
    revised_start_date: null,
    revised_end_date: null,
    actual_start_date: null,
    actual_end_date: null,
    physical_progress: 0,
    financial_progress: 0,
    status: 'planning',
    location: pipeline.location,
    created_by: '1',
    meta: null,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  };
  projectsStore.push(newProject);
  pipeline.status = 'converted';
  res.json({ data: newProject, message: 'Pipeline converted to project' });
});

// Land Administration
const landParcelsStore = [
  { id: '1', tenant_id: '1', ref_no: 'LND-001', title_number: 'TN/12345', title_status: 'registered', area_ha: 2.5, owner_name: 'John Kamau', owner_contact: '+254712345678', boundary: null, county: 'Nairobi', sub_county: 'Westlands', ward: 'Parklands', category_id: '1', project_id: '1', acquisition_status: 'acquired', notes: 'Pipeline right of way', created_by: '1', meta: null, created_at: '2024-03-15', updated_at: '2024-11-01' },
  { id: '2', tenant_id: '1', ref_no: 'LND-002', title_number: 'TN/23456', title_status: 'pending', area_ha: 5.8, owner_name: 'Mary Wanjiku', owner_contact: '+254723456789', boundary: null, county: 'Kiambu', sub_county: 'Ruiru', ward: 'Githurai', category_id: '1', project_id: '2', acquisition_status: 'negotiation', notes: 'Treatment plant site', created_by: '1', meta: null, created_at: '2024-06-20', updated_at: '2024-11-15' },
  { id: '3', tenant_id: '1', ref_no: 'LND-003', title_number: null, title_status: 'unregistered', area_ha: 0.8, owner_name: 'Peter Ochieng', owner_contact: '+254734567890', boundary: null, county: 'Mombasa', sub_county: 'Kisauni', ward: 'Bamburi', category_id: '2', project_id: null, acquisition_status: 'disputed', notes: 'Ownership dispute pending resolution', created_by: '1', meta: null, created_at: '2024-08-10', updated_at: '2024-11-18' },
];

const wayleaveStore = [
  { id: '1', tenant_id: '1', parcel_id: '1', wayleave_no: 'WL-2024-001', type: 'pipeline', width_m: 6, length_m: 1200, agreement_date: '2024-04-01', expiry_date: '2044-03-31', status: 'active', annual_fee: 50000, terms: '20-year easement for water pipeline', documents: null, created_at: '2024-04-01', updated_at: '2024-04-01' },
  { id: '2', tenant_id: '1', parcel_id: '2', wayleave_no: 'WL-2024-002', type: 'access_road', width_m: 4, length_m: 800, agreement_date: '2024-07-15', expiry_date: '2025-07-14', status: 'pending', annual_fee: 25000, terms: 'Temporary access during construction', documents: null, created_at: '2024-07-15', updated_at: '2024-11-01' },
];

const compensationStore = [
  { id: '1', tenant_id: '1', parcel_id: '1', comp_no: 'CMP-2024-001', valuation_amount: 2500000, negotiated_amount: 2800000, paid_amount: 2800000, comp_type: 'land_acquisition', valuation_date: '2024-02-15', payment_date: '2024-04-10', payment_reference: 'PAY-2024-0456', status: 'paid', valuation_notes: 'Market rate valuation', valued_by: '1', approved_by: '2', approved_at: '2024-03-20', meta: null, created_at: '2024-02-15', updated_at: '2024-04-10' },
  { id: '2', tenant_id: '1', parcel_id: '2', comp_no: 'CMP-2024-002', valuation_amount: 8500000, negotiated_amount: null, paid_amount: 0, comp_type: 'land_acquisition', valuation_date: '2024-08-01', payment_date: null, payment_reference: null, status: 'negotiated', valuation_notes: 'Pending owner acceptance', valued_by: '1', approved_by: null, approved_at: null, meta: null, created_at: '2024-08-01', updated_at: '2024-11-15' },
];

app.get('/api/v1/land', (req, res) => {
  res.json({ data: landParcelsStore });
});

app.post('/api/v1/land', (req, res) => {
  const { ref_no, owner_name, area_ha, county } = req.body;
  const newParcel = { id: String(landParcelsStore.length + 1), tenant_id: '1', ref_no, title_number: null, title_status: 'unregistered', area_ha, owner_name, owner_contact: null, boundary: null, county, sub_county: null, ward: null, category_id: null, project_id: null, acquisition_status: 'identified', notes: null, created_by: '1', meta: null, created_at: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString().split('T')[0] };
  landParcelsStore.push(newParcel);
  res.json({ data: newParcel });
});

app.get('/api/v1/land/:id/wayleaves', (req, res) => {
  res.json({ data: wayleaveStore.filter(w => w.parcel_id === req.params.id) });
});

app.post('/api/v1/land/:id/wayleaves', (req, res) => {
  const { type, width_m, length_m, agreement_date, expiry_date } = req.body;
  const newWayleave = { id: String(wayleaveStore.length + 1), tenant_id: '1', parcel_id: req.params.id, wayleave_no: `WL-2024-${String(wayleaveStore.length + 1).padStart(3, '0')}`, type, width_m, length_m, agreement_date, expiry_date, status: 'pending', annual_fee: null, terms: null, documents: null, created_at: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString().split('T')[0] };
  wayleaveStore.push(newWayleave);
  res.json({ data: newWayleave });
});

app.get('/api/v1/land/:id/compensations', (req, res) => {
  res.json({ data: compensationStore.filter(c => c.parcel_id === req.params.id) });
});

app.get('/api/v1/land/dashboard', (req, res) => {
  res.json({ data: {
    total_parcels: landParcelsStore.length,
    acquired: landParcelsStore.filter(p => p.acquisition_status === 'acquired').length,
    disputed: landParcelsStore.filter(p => p.acquisition_status === 'disputed').length,
    pending_compensation: compensationStore.filter(c => c.status !== 'paid').length,
    active_wayleaves: wayleaveStore.filter(w => w.status === 'active').length,
    expiring_wayleaves: wayleaveStore.filter(w => w.status === 'pending').length,
    total_compensation_paid: compensationStore.reduce((sum, c) => sum + c.paid_amount, 0)
  }});
});

// Models & Handover
const modelsStore = [
  { id: '1', model_name: 'Nairobi Distribution Network', engine: 'EPANET', version: '2.2', project_id: '1', created_by: 'Eng. James', created_at: '2024-05-01', runs_count: 15 },
  { id: '2', model_name: 'Mombasa Treatment Plant', engine: 'InfoWater', version: '3.1', project_id: '2', created_by: 'Eng. Mary', created_at: '2024-08-15', runs_count: 8 },
];

const handoversStore = [
  { id: '1', project_id: '5', project_title: 'Eldoret Meter Replacement Program', status: 'accepted', commissioning_date: '2024-07-25', assets_count: 2500, warranty_expiry: '2026-07-25', documents_count: 12, created_at: '2024-07-30' },
];

app.get('/api/v1/models', (req, res) => {
  res.json({ data: modelsStore });
});

app.post('/api/v1/models', (req, res) => {
  const { model_name, engine, version, project_id } = req.body;
  const newModel = { id: String(modelsStore.length + 1), model_name, engine, version, project_id, created_by: 'Current User', created_at: new Date().toISOString().split('T')[0], runs_count: 0 };
  modelsStore.push(newModel);
  res.json({ data: newModel });
});

app.get('/api/v1/handovers', (req, res) => {
  res.json({ data: handoversStore });
});

app.get('/api/v1/handovers/dashboard', (req, res) => {
  res.json({ data: { pending: 2, accepted: 1, rejected: 0, expiring_warranties: 1 }});
});

app.post('/api/v1/handovers', (req, res) => {
  const { project_id, commissioning_date } = req.body;
  const project = projectsStore.find(p => p.id === project_id);
  const newHandover = { id: String(handoversStore.length + 1), project_id, project_title: project?.title || 'Unknown', status: 'pending', commissioning_date, assets_count: 0, warranty_expiry: null, documents_count: 0, created_at: new Date().toISOString().split('T')[0] };
  handoversStore.push(newHandover);
  res.json({ data: newHandover });
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
