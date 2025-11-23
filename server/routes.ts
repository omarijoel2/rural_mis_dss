import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}
