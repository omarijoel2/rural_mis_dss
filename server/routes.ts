import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import integrationRouter from "./routes/integration";

export async function registerRoutes(app: Express): Promise<Server> {
  // GW4R Phase 1 Mock API Endpoints
  
  // Aquifer Management
  app.get('/api/hydromet/aquifers', (req, res) => {
    res.json({
      data: [
        { id: 1, name: 'Elwak Aquifer', safeYieldMcm: 15, currentYieldMcm: 12, rechargeRateMcm: 3, riskLevel: 'medium', waterQualityStatus: 'Good', areaKm2: 5000 },
        { id: 2, name: 'Merti Aquifer', safeYieldMcm: 20, currentYieldMcm: 18, rechargeRateMcm: 4, riskLevel: 'low', waterQualityStatus: 'Excellent', areaKm2: 8000 },
        { id: 3, name: 'Neogene Aquifer', safeYieldMcm: 10, currentYieldMcm: 9, rechargeRateMcm: 2, riskLevel: 'high', waterQualityStatus: 'Fair', areaKm2: 3000 },
      ]
    });
  });

  app.post('/api/hydromet/aquifers', (req, res) => {
    res.json({ id: 4, message: 'Aquifer registered', ...req.body });
  });

  // Drought Response
  app.get('/api/core-ops/droughts', (req, res) => {
    res.json({
      data: [
        { id: 1, name: '2025 ASAL Drought - Jan-Mar', status: 'active', severity: 'high', startDate: '2025-01-01', affectedPopulation: 125000, activatedBoreholes: 8, waterRationing: true },
        { id: 2, name: '2024 Oct-Dec Drought', status: 'resolved', severity: 'medium', startDate: '2024-10-01', endDate: '2024-12-15', affectedPopulation: 85000, activatedBoreholes: 5, waterRationing: false },
      ]
    });
  });

  app.post('/api/core-ops/droughts', (req, res) => {
    res.json({ id: 3, status: 'declared', message: 'Drought event declared', ...req.body });
  });

  app.post('/api/core-ops/droughts/:id/activate', (req, res) => {
    res.json({ id: req.params.id, status: 'active', message: 'Emergency response activated' });
  });

  // Gender & Equity Reporting
  app.get('/api/me/gender-equity', (req, res) => {
    res.json({
      data: [
        { id: 1, gender: 'female', count: 450, accessHours: 12, collectionTime: 45, satisfaction: 65 },
        { id: 2, gender: 'male', count: 320, accessHours: 15, collectionTime: 15, satisfaction: 78 },
        { id: 3, gender: 'youth', count: 280, accessHours: 14, collectionTime: 25, satisfaction: 72 },
        { id: 4, gender: 'elderly', count: 95, accessHours: 10, collectionTime: 60, satisfaction: 58 },
      ]
    });
  });

  // Capacity Assessments
  app.get('/api/training/assessments', (req, res) => {
    res.json({
      data: [
        { id: 1, operatorId: 'OP-001', operatorName: 'James Kipchoge', topic: 'operation', score: 85, maxScore: 100, status: 'completed', certificationValid: true, validUntil: '2026-01-15' },
        { id: 2, operatorId: 'OP-002', operatorName: 'Mary Nairobi', topic: 'maintenance', score: 92, maxScore: 100, status: 'completed', certificationValid: true, validUntil: '2026-06-10' },
        { id: 3, operatorId: 'OP-003', operatorName: 'Peter Mwangi', topic: 'safety', score: 78, maxScore: 100, status: 'completed', certificationValid: false, validUntil: null },
      ]
    });
  });

  app.post('/api/training/assessments', (req, res) => {
    res.json({ id: 4, status: 'pending', message: 'Assessment recorded', ...req.body });
  });

  // ============ COMMUNITY & STAKEHOLDER MODULE ============

  // Committees
  app.get('/api/community/committees', (req, res) => {
    res.json({
      data: [
        { id: '1', name: 'Kiambu Water Committee', community: 'Kiambu', members: 12, termStart: '2023-01-01', termEnd: '2025-12-31', lastElection: '2023-01-15', complianceScore: 92, status: 'active', genderQuota: 0.50, meetingFrequency: 'monthly' },
        { id: '2', name: 'Kajiado Water Committee', community: 'Kajiado', members: 10, termStart: '2024-01-01', termEnd: '2026-12-31', lastElection: '2024-01-20', complianceScore: 85, status: 'active', genderQuota: 0.40, meetingFrequency: 'bi-monthly' },
        { id: '3', name: 'Machakos Water Committee', community: 'Machakos', members: 14, termStart: '2022-06-01', termEnd: '2025-05-31', lastElection: '2022-06-10', complianceScore: 78, status: 'active', genderQuota: 0.57, meetingFrequency: 'monthly' },
      ],
      total: 24
    });
  });

  app.post('/api/community/committees', (req, res) => {
    res.json({ id: 'new-id', status: 'active', message: 'Committee created', ...req.body });
  });

  // Committee Finance/Cashbook
  app.get('/api/community/finance/cashbook', (req, res) => {
    res.json({
      data: [
        { id: '1', date: '2025-11-20', refNo: 'REC001', particulars: 'Monthly tariff collection', type: 'receipt', amount: 125000, fundSource: 'tariff', status: 'approved' },
        { id: '2', date: '2025-11-19', refNo: 'PAY001', particulars: 'Operator salary', type: 'payment', amount: 45000, fundSource: 'tariff', status: 'approved' },
        { id: '3', date: '2025-11-18', refNo: 'REC002', particulars: 'Connection fees', type: 'receipt', amount: 35000, fundSource: 'levy', status: 'approved' },
        { id: '4', date: '2025-11-17', refNo: 'PAY002', particulars: 'Maintenance supplies', type: 'payment', amount: 28000, fundSource: 'tariff', status: 'pending' },
      ],
      balance: 1200000
    });
  });

  app.post('/api/community/finance/cashbook', (req, res) => {
    res.json({ id: 'new-entry', status: 'pending', message: 'Cashbook entry recorded', ...req.body });
  });

  // Vendors
  app.get('/api/partner/vendors', (req, res) => {
    res.json({
      data: [
        { id: '1', companyName: 'WaterTech Solutions', status: 'approved', kycStatus: 'verified', registrationNumber: 'PVT001', email: 'info@watertech.ke', rating: 4.8, otifScore: 0.94, categories: ['pumps', 'pipes', 'valves'] },
        { id: '2', companyName: 'Nairobi Supplies Ltd', status: 'approved', kycStatus: 'verified', registrationNumber: 'PVT002', email: 'sales@nairobi-supplies.ke', rating: 4.5, otifScore: 0.89, categories: ['chemicals', 'testing-equipment'] },
        { id: '3', companyName: 'Constructor Engineering', status: 'pending', kycStatus: 'pending', registrationNumber: 'PVT003', email: 'bids@constructor-eng.ke', rating: 0, otifScore: 0, categories: ['civil-works', 'installation'] },
      ],
      total: 142
    });
  });

  app.post('/api/partner/vendors', (req, res) => {
    res.json({ id: 'new-vendor', status: 'pending', kycStatus: 'pending', message: 'Vendor registered', ...req.body });
  });

  // Bids
  app.get('/api/partner/bids', (req, res) => {
    res.json({
      data: [
        { id: '1', rfqId: 'RFQ-2025-001', vendorName: 'WaterTech Solutions', status: 'submitted', items: 5, priceTotal: 850000, leadTime: 14 },
        { id: '2', rfqId: 'RFQ-2025-001', vendorName: 'Nairobi Supplies Ltd', status: 'submitted', items: 5, priceTotal: 920000, leadTime: 21 },
        { id: '3', rfqId: 'RFQ-2025-002', vendorName: 'Constructor Engineering', status: 'submitted', items: 3, priceTotal: 2500000, leadTime: 45 },
      ],
      total: 28
    });
  });

  // Grievances (GRM)
  app.get('/api/grm/tickets', (req, res) => {
    res.json({
      data: [
        { id: '1', ticketNumber: 'GRM-2025-001', category: 'water-quality', severity: 'high', status: 'new', location: 'Kilimani Estate', details: 'Turbid water supply', createdAt: '2025-11-20', slaDueAt: '2025-11-22' },
        { id: '2', ticketNumber: 'GRM-2025-002', category: 'billing', severity: 'medium', status: 'assigned', location: 'Westlands', details: 'Overcharge on meter reading', createdAt: '2025-11-19', slaDueAt: '2025-11-23' },
        { id: '3', ticketNumber: 'GRM-2025-003', category: 'service', severity: 'medium', status: 'in-progress', location: 'South C', details: 'Intermittent supply', createdAt: '2025-11-18', slaDueAt: '2025-11-24' },
        { id: '4', ticketNumber: 'GRM-2025-004', category: 'billing', severity: 'low', status: 'resolved', location: 'Langata', details: 'Billing inquiry', createdAt: '2025-11-15', slaDueAt: '2025-11-20', resolvedAt: '2025-11-19' },
      ],
      stats: { new: 12, assigned: 8, inProgress: 28, resolved: 156, overdueSla: 3 }
    });
  });

  app.post('/api/grm/tickets', (req, res) => {
    res.json({ id: 'new-ticket', ticketNumber: 'GRM-2025-NEW', status: 'new', message: 'Grievance submitted', ...req.body });
  });

  app.patch('/api/grm/tickets/:id', (req, res) => {
    res.json({ id: req.params.id, status: req.body.status, message: 'Ticket updated' });
  });

  // Stakeholders
  app.get('/api/community/stakeholders', (req, res) => {
    res.json({
      data: [
        { id: '1', name: 'Jane Kipchoge', organization: 'Nairobi Water Works', type: 'community', influence: 8, interest: 9, tags: ['leadership', 'active'] },
        { id: '2', name: 'Peter Mwangi', organization: 'Kenyan Red Cross', type: 'ngo', influence: 7, interest: 8, tags: ['humanitarian', 'outreach'] },
        { id: '3', name: 'Susan Otieno', organization: 'County Health', type: 'government', influence: 9, interest: 7, tags: ['regulator', 'planning'] },
      ],
      total: 45
    });
  });

  // Engagements
  app.get('/api/community/engagements', (req, res) => {
    res.json({
      data: [
        { id: '1', title: 'Community Awareness Forum', scheduledAt: '2025-12-05', location: 'Kiambu Market', channel: 'in-person', attendees: 0, status: 'planned' },
        { id: '2', title: 'Committee Budget Review', scheduledAt: '2025-11-28', location: 'Kiambu Office', channel: 'in-person', attendees: 12, status: 'planned' },
      ],
      total: 18
    });
  });

  // Open Data Catalog
  app.get('/api/open-data/catalog', (req, res) => {
    res.json({
      data: [
        { id: '1', title: 'Water Coverage by Ward', topic: 'operations', license: 'CC BY 4.0', freshness: '1 day old', downloads: 234, rating: 4.5 },
        { id: '2', title: 'Monthly Revenue Report', topic: 'finance', license: 'CC BY 4.0', freshness: '5 days old', downloads: 156, rating: 4.2 },
        { id: '3', title: 'Water Quality Metrics', topic: 'quality', license: 'ODC-BY', freshness: '2 hours old', downloads: 89, rating: 4.8 },
      ]
    });
  });

  // ============ INTEGRATION MODULE (Phase 1-3) ============
  app.use('/api/v1/integration', integrationRouter);

  const httpServer = createServer(app);

  return httpServer;
}
