import express, { type Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import shp from "shpjs";
import AdmZip from "adm-zip";
import { registerRoutes } from "./routes";
import { registerCoreRegistryRoutes } from "./routes/core-registry";
import { setupVite, serveStatic, log } from "./vite";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'shapefiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.shp', '.geojson', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: ZIP, SHP, GeoJSON'));
    }
  }
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// GIS Shapefile Store
interface ShapeFileRecord {
  id: string;
  name: string;
  description: string;
  file_size: number;
  geom_type: string;
  feature_count: number;
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  projection_crs: string;
  bounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
  uploaded_at: string;
  uploaded_by: { name: string; email: string };
  file_path: string;
}

let shapeFileCounter = 0;
const shapeFileStore: ShapeFileRecord[] = [];

// GW4R Phase 1 Mock API Endpoints (before proxy)
let aquiferCounter = 7;
const aquiferStore = [
  { id: 1, name: 'Elwak Aquifer', safeYieldMcm: 15, currentYieldMcm: 12, rechargeRateMcm: 3, riskLevel: 'medium', waterQualityStatus: 'Good', areaKm2: 5000, county: 'Mandera', aquiferType: 'Alluvial', depth_m: 45, boreholes: 12, lastAssessment: '2025-10-15' },
  { id: 2, name: 'Merti Aquifer', safeYieldMcm: 20, currentYieldMcm: 18, rechargeRateMcm: 4, riskLevel: 'low', waterQualityStatus: 'Excellent', areaKm2: 8000, county: 'Isiolo', aquiferType: 'Basement', depth_m: 80, boreholes: 18, lastAssessment: '2025-09-20' },
  { id: 3, name: 'Neogene Aquifer', safeYieldMcm: 10, currentYieldMcm: 9, rechargeRateMcm: 2, riskLevel: 'high', waterQualityStatus: 'Fair', areaKm2: 3000, county: 'Wajir', aquiferType: 'Sedimentary', depth_m: 120, boreholes: 8, lastAssessment: '2025-08-05' },
  { id: 4, name: 'Chalbi Aquifer', safeYieldMcm: 25, currentYieldMcm: 22, rechargeRateMcm: 5, riskLevel: 'medium', waterQualityStatus: 'Good', areaKm2: 12000, county: 'Marsabit', aquiferType: 'Volcanic', depth_m: 95, boreholes: 22, lastAssessment: '2025-11-01' },
  { id: 5, name: 'Lotikipi Aquifer', safeYieldMcm: 30, currentYieldMcm: 28, rechargeRateMcm: 6, riskLevel: 'critical', waterQualityStatus: 'Poor', areaKm2: 15000, county: 'Turkana', aquiferType: 'Alluvial', depth_m: 60, boreholes: 25, lastAssessment: '2025-07-18' },
  { id: 6, name: 'Garissa Aquifer', safeYieldMcm: 18, currentYieldMcm: 14, rechargeRateMcm: 4, riskLevel: 'low', waterQualityStatus: 'Excellent', areaKm2: 7500, county: 'Garissa', aquiferType: 'Basement', depth_m: 70, boreholes: 15, lastAssessment: '2025-10-28' },
  { id: 7, name: 'Tana Delta Aquifer', safeYieldMcm: 35, currentYieldMcm: 30, rechargeRateMcm: 8, riskLevel: 'medium', waterQualityStatus: 'Good', areaKm2: 18000, county: 'Tana River', aquiferType: 'Coastal', depth_m: 35, boreholes: 28, lastAssessment: '2025-11-10' },
];

// Aquifer monitoring data (time series)
const aquiferMonitoringData: Record<number, any[]> = {
  1: [
    { date: '2025-01', waterLevel_m: 42, abstraction_mcm: 1.0, recharge_mcm: 0.25, quality_score: 85 },
    { date: '2025-02', waterLevel_m: 43, abstraction_mcm: 1.1, recharge_mcm: 0.2, quality_score: 84 },
    { date: '2025-03', waterLevel_m: 44, abstraction_mcm: 1.2, recharge_mcm: 0.15, quality_score: 83 },
    { date: '2025-04', waterLevel_m: 43, abstraction_mcm: 1.0, recharge_mcm: 0.3, quality_score: 86 },
    { date: '2025-05', waterLevel_m: 42, abstraction_mcm: 0.9, recharge_mcm: 0.35, quality_score: 87 },
    { date: '2025-06', waterLevel_m: 41, abstraction_mcm: 0.85, recharge_mcm: 0.4, quality_score: 88 },
  ],
  2: [
    { date: '2025-01', waterLevel_m: 78, abstraction_mcm: 1.5, recharge_mcm: 0.35, quality_score: 92 },
    { date: '2025-02', waterLevel_m: 79, abstraction_mcm: 1.6, recharge_mcm: 0.3, quality_score: 91 },
    { date: '2025-03', waterLevel_m: 80, abstraction_mcm: 1.7, recharge_mcm: 0.25, quality_score: 90 },
    { date: '2025-04', waterLevel_m: 79, abstraction_mcm: 1.5, recharge_mcm: 0.4, quality_score: 93 },
    { date: '2025-05', waterLevel_m: 78, abstraction_mcm: 1.4, recharge_mcm: 0.45, quality_score: 94 },
    { date: '2025-06', waterLevel_m: 77, abstraction_mcm: 1.3, recharge_mcm: 0.5, quality_score: 95 },
  ],
};

// Support both /api/hydromet/aquifers and /api/v1/hydromet/aquifers
const aquiferHandler = (req: Request, res: Response) => {
  res.json({ data: aquiferStore, meta: { total: aquiferStore.length } });
};
app.get('/api/hydromet/aquifers', aquiferHandler);
app.get('/api/v1/hydromet/aquifers', aquiferHandler);

const createAquiferHandler = (req: Request, res: Response) => {
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
    areaKm2: Math.floor(Math.random() * 10000) + 1000,
    county: 'Unknown',
    aquiferType: 'Alluvial',
    depth_m: Math.floor(Math.random() * 100) + 30,
    boreholes: 0,
    lastAssessment: new Date().toISOString().split('T')[0],
  };
  aquiferStore.push(newAquifer);
  res.json({ data: newAquifer, message: 'Aquifer registered successfully' });
};
app.post('/api/hydromet/aquifers', createAquiferHandler);
app.post('/api/v1/hydromet/aquifers', createAquiferHandler);

// Aquifer detail endpoint
app.get('/api/v1/hydromet/aquifers/:id', (req, res) => {
  const aquifer = aquiferStore.find(a => a.id === parseInt(req.params.id));
  if (!aquifer) return res.status(404).json({ error: 'Aquifer not found' });
  res.json({ data: aquifer });
});

// Aquifer monitoring data endpoint
app.get('/api/v1/hydromet/aquifers/:id/monitoring', (req, res) => {
  const id = parseInt(req.params.id);
  const data = aquiferMonitoringData[id] || [
    { date: '2025-01', waterLevel_m: 50, abstraction_mcm: 1.0, recharge_mcm: 0.3, quality_score: 80 },
    { date: '2025-02', waterLevel_m: 51, abstraction_mcm: 1.1, recharge_mcm: 0.28, quality_score: 79 },
    { date: '2025-03', waterLevel_m: 52, abstraction_mcm: 1.15, recharge_mcm: 0.25, quality_score: 78 },
    { date: '2025-04', waterLevel_m: 51, abstraction_mcm: 1.0, recharge_mcm: 0.35, quality_score: 81 },
    { date: '2025-05', waterLevel_m: 50, abstraction_mcm: 0.95, recharge_mcm: 0.4, quality_score: 82 },
    { date: '2025-06', waterLevel_m: 49, abstraction_mcm: 0.9, recharge_mcm: 0.45, quality_score: 83 },
  ];
  res.json({ data });
});

// Groundwater monitoring wells
app.get('/api/v1/hydromet/monitoring-wells', (req, res) => {
  res.json({
    data: [
      { id: 1, wellId: 'MW-001', aquiferId: 1, name: 'Elwak Monitoring Well 1', latitude: 3.456, longitude: 40.123, depth_m: 48, waterLevel_m: 42, lastReading: '2025-11-28', status: 'active' },
      { id: 2, wellId: 'MW-002', aquiferId: 1, name: 'Elwak Monitoring Well 2', latitude: 3.478, longitude: 40.145, depth_m: 52, waterLevel_m: 44, lastReading: '2025-11-28', status: 'active' },
      { id: 3, wellId: 'MW-003', aquiferId: 2, name: 'Merti Observation Well', latitude: 1.234, longitude: 38.567, depth_m: 85, waterLevel_m: 78, lastReading: '2025-11-27', status: 'active' },
      { id: 4, wellId: 'MW-004', aquiferId: 3, name: 'Neogene Deep Well', latitude: 2.345, longitude: 39.876, depth_m: 125, waterLevel_m: 118, lastReading: '2025-11-25', status: 'maintenance' },
    ],
    meta: { total: 4 }
  });
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

// ============ ADMINISTRATIVE BOUNDARIES (Mock) ============
const subCountiesStore: Record<string, any[]> = {
  '1': [ // Mandera County
    { id: 'sc-1-1', name: 'Mandera East', code: 'ME', population: 125000, area_km2: 1850, headquarters: 'Mandera Town', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.8, 3.5], [41.5, 3.5], [41.5, 4.2], [40.8, 4.2], [40.8, 3.5]]] }, properties: { name: 'Mandera East', type: 'sub_county' } } },
    { id: 'sc-1-2', name: 'Mandera West', code: 'MW', population: 98000, area_km2: 2100, headquarters: 'Takaba', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.0, 3.5], [40.8, 3.5], [40.8, 4.2], [40.0, 4.2], [40.0, 3.5]]] }, properties: { name: 'Mandera West', type: 'sub_county' } } },
    { id: 'sc-1-3', name: 'Mandera North', code: 'MN', population: 78000, area_km2: 2450, headquarters: 'Rhamu', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 4.2], [41.2, 4.2], [41.2, 4.5], [40.4, 4.5], [40.4, 4.2]]] }, properties: { name: 'Mandera North', type: 'sub_county' } } },
    { id: 'sc-1-4', name: 'Mandera South', code: 'MS', population: 89000, area_km2: 1950, headquarters: 'Elwak', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 3.0], [41.2, 3.0], [41.2, 3.5], [40.4, 3.5], [40.4, 3.0]]] }, properties: { name: 'Mandera South', type: 'sub_county' } } },
    { id: 'sc-1-5', name: 'Banissa', code: 'BN', population: 65000, area_km2: 1650, headquarters: 'Banissa', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.0, 3.0], [40.4, 3.0], [40.4, 3.5], [40.0, 3.5], [40.0, 3.0]]] }, properties: { name: 'Banissa', type: 'sub_county' } } },
    { id: 'sc-1-6', name: 'Lafey', code: 'LF', population: 52000, area_km2: 1400, headquarters: 'Lafey', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[41.2, 3.5], [41.5, 3.5], [41.5, 4.0], [41.2, 4.0], [41.2, 3.5]]] }, properties: { name: 'Lafey', type: 'sub_county' } } },
  ],
  '2': [ // Isiolo County
    { id: 'sc-2-1', name: 'Isiolo Central', code: 'IC', population: 95000, area_km2: 3200, headquarters: 'Isiolo Town', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[37.8, 0.3], [38.4, 0.3], [38.4, 1.0], [37.8, 1.0], [37.8, 0.3]]] }, properties: { name: 'Isiolo Central', type: 'sub_county' } } },
    { id: 'sc-2-2', name: 'Garbatulla', code: 'GB', population: 72000, area_km2: 4500, headquarters: 'Garbatulla', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[38.4, 0.0], [39.0, 0.0], [39.0, 1.0], [38.4, 1.0], [38.4, 0.0]]] }, properties: { name: 'Garbatulla', type: 'sub_county' } } },
    { id: 'sc-2-3', name: 'Merti', code: 'MT', population: 48000, area_km2: 5100, headquarters: 'Merti', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[37.5, 1.0], [39.0, 1.0], [39.0, 2.0], [37.5, 2.0], [37.5, 1.0]]] }, properties: { name: 'Merti', type: 'sub_county' } } },
  ],
};

const wardsStore: Record<string, any[]> = {
  'sc-1-1': [ // Mandera East wards
    { id: 'w-1-1-1', name: 'Neboi', code: 'NB', population: 28000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.8, 3.5], [41.15, 3.5], [41.15, 3.85], [40.8, 3.85], [40.8, 3.5]]] }, properties: { name: 'Neboi', type: 'ward' } } },
    { id: 'w-1-1-2', name: 'Township', code: 'TW', population: 42000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[41.15, 3.5], [41.5, 3.5], [41.5, 3.85], [41.15, 3.85], [41.15, 3.5]]] }, properties: { name: 'Township', type: 'ward' } } },
    { id: 'w-1-1-3', name: 'Khalalio', code: 'KH', population: 32000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.8, 3.85], [41.15, 3.85], [41.15, 4.2], [40.8, 4.2], [40.8, 3.85]]] }, properties: { name: 'Khalalio', type: 'ward' } } },
    { id: 'w-1-1-4', name: 'Arabia', code: 'AR', population: 23000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[41.15, 3.85], [41.5, 3.85], [41.5, 4.2], [41.15, 4.2], [41.15, 3.85]]] }, properties: { name: 'Arabia', type: 'ward' } } },
  ],
  'sc-1-2': [ // Mandera West wards
    { id: 'w-1-2-1', name: 'Takaba', code: 'TK', population: 35000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.0, 3.5], [40.4, 3.5], [40.4, 3.85], [40.0, 3.85], [40.0, 3.5]]] }, properties: { name: 'Takaba', type: 'ward' } } },
    { id: 'w-1-2-2', name: 'Takaba South', code: 'TS', population: 28000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 3.5], [40.8, 3.5], [40.8, 3.85], [40.4, 3.85], [40.4, 3.5]]] }, properties: { name: 'Takaba South', type: 'ward' } } },
    { id: 'w-1-2-3', name: 'Dandu', code: 'DD', population: 18000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.0, 3.85], [40.4, 3.85], [40.4, 4.2], [40.0, 4.2], [40.0, 3.85]]] }, properties: { name: 'Dandu', type: 'ward' } } },
    { id: 'w-1-2-4', name: 'Gither', code: 'GT', population: 17000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 3.85], [40.8, 3.85], [40.8, 4.2], [40.4, 4.2], [40.4, 3.85]]] }, properties: { name: 'Gither', type: 'ward' } } },
  ],
  'sc-1-3': [ // Mandera North wards
    { id: 'w-1-3-1', name: 'Rhamu', code: 'RH', population: 28000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 4.2], [40.8, 4.2], [40.8, 4.5], [40.4, 4.5], [40.4, 4.2]]] }, properties: { name: 'Rhamu', type: 'ward' } } },
    { id: 'w-1-3-2', name: 'Rhamu Dimtu', code: 'RD', population: 25000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.8, 4.2], [41.2, 4.2], [41.2, 4.5], [40.8, 4.5], [40.8, 4.2]]] }, properties: { name: 'Rhamu Dimtu', type: 'ward' } } },
    { id: 'w-1-3-3', name: 'Ashabito', code: 'AS', population: 25000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 4.35], [40.8, 4.35], [40.8, 4.5], [40.4, 4.5], [40.4, 4.35]]] }, properties: { name: 'Ashabito', type: 'ward' } } },
  ],
  'sc-1-4': [ // Mandera South wards
    { id: 'w-1-4-1', name: 'Elwak South', code: 'ES', population: 32000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 3.0], [40.8, 3.0], [40.8, 3.25], [40.4, 3.25], [40.4, 3.0]]] }, properties: { name: 'Elwak South', type: 'ward' } } },
    { id: 'w-1-4-2', name: 'Elwak North', code: 'EN', population: 29000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.8, 3.0], [41.2, 3.0], [41.2, 3.25], [40.8, 3.25], [40.8, 3.0]]] }, properties: { name: 'Elwak North', type: 'ward' } } },
    { id: 'w-1-4-3', name: 'Shimbir Fatuma', code: 'SF', population: 28000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.4, 3.25], [41.2, 3.25], [41.2, 3.5], [40.4, 3.5], [40.4, 3.25]]] }, properties: { name: 'Shimbir Fatuma', type: 'ward' } } },
  ],
  'sc-1-5': [ // Banissa wards
    { id: 'w-1-5-1', name: 'Banissa', code: 'BN', population: 22000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.0, 3.0], [40.2, 3.0], [40.2, 3.25], [40.0, 3.25], [40.0, 3.0]]] }, properties: { name: 'Banissa', type: 'ward' } } },
    { id: 'w-1-5-2', name: 'Derkhale', code: 'DK', population: 18000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.2, 3.0], [40.4, 3.0], [40.4, 3.25], [40.2, 3.25], [40.2, 3.0]]] }, properties: { name: 'Derkhale', type: 'ward' } } },
    { id: 'w-1-5-3', name: 'Guba', code: 'GB', population: 25000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.0, 3.25], [40.4, 3.25], [40.4, 3.5], [40.0, 3.5], [40.0, 3.25]]] }, properties: { name: 'Guba', type: 'ward' } } },
  ],
  'sc-1-6': [ // Lafey wards
    { id: 'w-1-6-1', name: 'Lafey', code: 'LF', population: 18000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[41.2, 3.5], [41.35, 3.5], [41.35, 3.75], [41.2, 3.75], [41.2, 3.5]]] }, properties: { name: 'Lafey', type: 'ward' } } },
    { id: 'w-1-6-2', name: 'Sala', code: 'SL', population: 16000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[41.35, 3.5], [41.5, 3.5], [41.5, 3.75], [41.35, 3.75], [41.35, 3.5]]] }, properties: { name: 'Sala', type: 'ward' } } },
    { id: 'w-1-6-3', name: 'Waranqara', code: 'WQ', population: 18000, boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[41.2, 3.75], [41.5, 3.75], [41.5, 4.0], [41.2, 4.0], [41.2, 3.75]]] }, properties: { name: 'Waranqara', type: 'ward' } } },
  ],
};

// ============ AUTHENTICATION (Mock) ============
const tenantStore = [
  { id: '1', name: 'Mandera County Water Service', county: 'Mandera', region: 'ASAL North', code: 'MCW', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[40.0, 3.0], [41.5, 3.0], [41.5, 4.5], [40.0, 4.5], [40.0, 3.0]]] }, properties: { name: 'Mandera County' } } },
  { id: '2', name: 'Isiolo County Water Services', county: 'Isiolo', region: 'ASAL Central', code: 'ICW', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[37.5, 0.0], [39.0, 0.0], [39.0, 2.0], [37.5, 2.0], [37.5, 0.0]]] }, properties: { name: 'Isiolo County' } } },
  { id: '3', name: 'Turkana County Water Board', county: 'Turkana', region: 'ASAL North West', code: 'TCW', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[34.0, 2.5], [36.5, 2.5], [36.5, 5.0], [34.0, 5.0], [34.0, 2.5]]] }, properties: { name: 'Turkana County' } } },
  { id: '4', name: 'Marsabit County Water Company', county: 'Marsabit', region: 'ASAL North', code: 'MCWC', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[36.5, 2.0], [38.5, 2.0], [38.5, 4.5], [36.5, 4.5], [36.5, 2.0]]] }, properties: { name: 'Marsabit County' } } },
  { id: '5', name: 'Garissa County Water Services', county: 'Garissa', region: 'ASAL East', code: 'GCW', boundary_geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[39.0, -1.0], [41.5, -1.0], [41.5, 2.0], [39.0, 2.0], [39.0, -1.0]]] }, properties: { name: 'Garissa County' } } },
];

// auth/user endpoint is handled by Laravel backend via proxy

// Tenant details endpoint
app.get('/api/v1/tenants/current', (req, res) => {
  const tenantId = req.query.tenant_id as string || '1';
  const tenant = tenantStore.find(t => t.id === tenantId) || tenantStore[0];
  res.json({ data: tenant });
});

// Tenant boundary GeoJSON endpoint
app.get('/api/v1/tenants/current/boundary', (req, res) => {
  const tenantId = req.query.tenant_id as string || '1';
  const tenant = tenantStore.find(t => t.id === tenantId) || tenantStore[0];
  res.json({ data: tenant.boundary_geojson });
});

// All tenants list
app.get('/api/v1/tenants', (req, res) => {
  res.json({ data: tenantStore.map(t => ({ id: t.id, name: t.name, county: t.county, region: t.region, code: t.code })), meta: { total: tenantStore.length } });
});

// Sub-counties for current tenant
app.get('/api/v1/tenants/current/sub-counties', (req, res) => {
  const tenantId = req.query.tenant_id as string || '1';
  const subCounties = subCountiesStore[tenantId] || [];
  res.json({ data: subCounties, meta: { total: subCounties.length } });
});

// Sub-counties GeoJSON FeatureCollection
app.get('/api/v1/tenants/current/sub-counties/geojson', (req, res) => {
  const tenantId = req.query.tenant_id as string || '1';
  const subCounties = subCountiesStore[tenantId] || [];
  const featureCollection = {
    type: 'FeatureCollection',
    features: subCounties.map(sc => ({
      ...sc.boundary_geojson,
      properties: {
        ...sc.boundary_geojson.properties,
        id: sc.id,
        code: sc.code,
        population: sc.population,
        area_km2: sc.area_km2,
        headquarters: sc.headquarters
      }
    }))
  };
  res.json({ data: featureCollection });
});

// Wards for a sub-county
app.get('/api/v1/sub-counties/:subCountyId/wards', (req, res) => {
  const subCountyId = req.params.subCountyId;
  const wards = wardsStore[subCountyId] || [];
  res.json({ data: wards, meta: { total: wards.length } });
});

// All wards for current tenant (flattened)
app.get('/api/v1/tenants/current/wards', (req, res) => {
  const tenantId = req.query.tenant_id as string || '1';
  const subCounties = subCountiesStore[tenantId] || [];
  const allWards = subCounties.flatMap(sc => wardsStore[sc.id] || []);
  res.json({ data: allWards, meta: { total: allWards.length } });
});

// Wards GeoJSON FeatureCollection for current tenant
app.get('/api/v1/tenants/current/wards/geojson', (req, res) => {
  const tenantId = req.query.tenant_id as string || '1';
  const subCounties = subCountiesStore[tenantId] || [];
  const allWards = subCounties.flatMap(sc => {
    const scWards = wardsStore[sc.id] || [];
    return scWards.map(w => ({
      ...w.boundary_geojson,
      properties: {
        ...w.boundary_geojson.properties,
        id: w.id,
        code: w.code,
        population: w.population,
        sub_county_id: sc.id,
        sub_county_name: sc.name
      }
    }));
  });
  const featureCollection = {
    type: 'FeatureCollection',
    features: allWards
  };
  res.json({ data: featureCollection });
});

// ============ ADMIN USERS MODULE (Mock) ============
let userCounter = 5;
const userStore = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', tenant_id: '1' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', tenant_id: '1' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', tenant_id: '1' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'manager', tenant_id: '1' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'user', tenant_id: '1' },
];

app.get('/api/v1/admin/users', (req, res) => {
  res.json({ data: userStore, meta: { total: userStore.length, per_page: 50, current_page: 1 } });
});

app.post('/api/v1/admin/users/bulk-import', (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Invalid users array' });
    }

    const imported = users.map(user => {
      const newUser = {
        id: ++userCounter,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id || '1',
      };
      userStore.push(newUser);
      return newUser;
    });

    res.json({ 
      data: imported, 
      message: `Successfully imported ${imported.length} users`,
      meta: { total: userStore.length }
    });
  } catch (error) {
    res.status(400).json({ error: 'Import failed', details: (error as Error).message });
  }
});

app.get('/api/v1/admin/users/export', (req, res) => {
  res.json({ 
    data: userStore,
    message: `Exported ${userStore.length} users`
  });
});

// ============ GIS SHAPEFILE ENDPOINTS ============
// List all shapefiles
app.get('/api/v1/gis/shape-files', (req, res) => {
  res.json({ 
    data: shapeFileStore,
    meta: { total: shapeFileStore.length }
  });
});

// Upload a new shapefile
app.post('/api/v1/gis/shape-files', upload.single('file'), (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let geomType = 'Unknown';
    if (ext === '.geojson' || ext === '.json') {
      geomType = 'GeoJSON';
    } else if (ext === '.zip') {
      geomType = 'Shapefile (ZIP)';
    } else if (ext === '.shp') {
      geomType = 'Shapefile';
    }

    const newShapeFile: ShapeFileRecord = {
      id: `sf-${++shapeFileCounter}`,
      name,
      description: description || '',
      file_size: req.file.size,
      geom_type: geomType,
      feature_count: Math.floor(Math.random() * 500) + 10,
      status: 'processed',
      projection_crs: 'EPSG:4326',
      bounds: { minX: 40.0, minY: 3.0, maxX: 42.0, maxY: 5.0 },
      uploaded_at: new Date().toISOString(),
      uploaded_by: { name: 'Current User', email: 'user@example.com' },
      file_path: req.file.path,
    };

    shapeFileStore.push(newShapeFile);
    log(`[GIS] Shapefile uploaded: ${name} (${req.file.size} bytes)`);

    res.json({ 
      data: newShapeFile,
      message: 'Shapefile uploaded successfully'
    });
  } catch (error) {
    log(`[GIS] Upload error: ${(error as Error).message}`);
    res.status(500).json({ error: 'Failed to upload shapefile' });
  }
});

// Get shapefile by ID
app.get('/api/v1/gis/shape-files/:id', (req, res) => {
  const shapeFile = shapeFileStore.find(sf => sf.id === req.params.id);
  if (!shapeFile) {
    return res.status(404).json({ error: 'Shapefile not found' });
  }
  res.json({ data: shapeFile });
});

// Delete shapefile
app.delete('/api/v1/gis/shape-files/:id', (req, res) => {
  const index = shapeFileStore.findIndex(sf => sf.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Shapefile not found' });
  }
  
  const deleted = shapeFileStore.splice(index, 1)[0];
  
  // Try to delete the actual file
  if (deleted.file_path && fs.existsSync(deleted.file_path)) {
    try {
      fs.unlinkSync(deleted.file_path);
    } catch (e) {
      log(`[GIS] Failed to delete file: ${deleted.file_path}`);
    }
  }
  
  log(`[GIS] Shapefile deleted: ${deleted.name}`);
  res.json({ message: 'Shapefile deleted successfully' });
});

// Get shapefile layers (vector layers for styling)
app.get('/api/v1/gis/shape-files/:id/layers', (req, res) => {
  const shapeFile = shapeFileStore.find(sf => sf.id === req.params.id);
  if (!shapeFile) {
    return res.status(404).json({ error: 'Shapefile not found' });
  }
  res.json({ 
    data: [],
    meta: { total: 0 }
  });
});

// Get shapefile GeoJSON data for preview
app.get('/api/v1/gis/shape-files/:id/geojson', async (req, res) => {
  const shapeFile = shapeFileStore.find(sf => sf.id === req.params.id);
  if (!shapeFile) {
    return res.status(404).json({ error: 'Shapefile not found' });
  }

  try {
    const filePath = shapeFile.file_path;
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.geojson' || ext === '.json') {
      const content = fs.readFileSync(filePath, 'utf-8');
      const geojson = JSON.parse(content);
      
      let bounds = null;
      if (geojson.features && geojson.features.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        const processCoords = (coords: any) => {
          if (typeof coords[0] === 'number') {
            minX = Math.min(minX, coords[0]);
            maxX = Math.max(maxX, coords[0]);
            minY = Math.min(minY, coords[1]);
            maxY = Math.max(maxY, coords[1]);
          } else {
            coords.forEach(processCoords);
          }
        };
        
        geojson.features.forEach((f: any) => {
          if (f.geometry && f.geometry.coordinates) {
            processCoords(f.geometry.coordinates);
          }
        });
        
        if (minX !== Infinity) {
          bounds = { minX, minY, maxX, maxY };
        }
      }
      
      res.json({ data: geojson, bounds });
    } else if (ext === '.zip') {
      // Validate ZIP contents before parsing
      const zipBuffer = fs.readFileSync(filePath);
      const zip = new AdmZip(zipBuffer);
      const entries = zip.getEntries();
      const fileNames = entries.map(e => e.entryName.toLowerCase());
      
      // Check for .gdb folder (File Geodatabase - not supported)
      if (fileNames.some(f => f.includes('.gdb/') || f.endsWith('.gdb'))) {
        log('[GIS] File Geodatabase format detected - not supported');
        return res.status(400).json({ 
          error: 'File Geodatabase (.gdb) format is not supported. Please export your data as a Shapefile or GeoJSON instead.' 
        });
      }
      
      // Check for required shapefile components (.shp, .dbf are required)
      const hasShp = fileNames.some(f => f.endsWith('.shp'));
      const hasDbf = fileNames.some(f => f.endsWith('.dbf'));
      
      if (!hasShp || !hasDbf) {
        // List what was found to help debugging
        const foundTypes = [...new Set(fileNames.map(f => path.extname(f)).filter(Boolean))];
        log(`[GIS] Invalid shapefile ZIP - missing required components. Found: ${foundTypes.join(', ')}`);
        return res.status(400).json({ 
          error: `Invalid shapefile ZIP. Required files (.shp, .dbf) not found. This ZIP contains: ${foundTypes.join(', ') || 'no recognized files'}. Please ensure your ZIP contains a valid Shapefile (.shp, .shx, .dbf files).`
        });
      }
      
      // Parse shapefile from ZIP using shpjs
      const geojson = await shp(zipBuffer);
      
      let bounds = null;
      const features = Array.isArray(geojson) ? geojson[0]?.features || [] : geojson.features || [];
      
      if (features.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        const processCoords = (coords: any) => {
          if (typeof coords[0] === 'number') {
            minX = Math.min(minX, coords[0]);
            maxX = Math.max(maxX, coords[0]);
            minY = Math.min(minY, coords[1]);
            maxY = Math.max(maxY, coords[1]);
          } else {
            coords.forEach(processCoords);
          }
        };
        
        features.forEach((f: any) => {
          if (f.geometry && f.geometry.coordinates) {
            processCoords(f.geometry.coordinates);
          }
        });
        
        if (minX !== Infinity) {
          bounds = { minX, minY, maxX, maxY };
        }
      }
      
      // Handle case where shpjs returns array of feature collections
      const resultGeojson = Array.isArray(geojson) ? geojson[0] : geojson;
      
      res.json({ data: resultGeojson, bounds });
    } else {
      res.status(400).json({ error: 'Unsupported file format for preview' });
    }
  } catch (error) {
    log(`[GIS] Error reading shapefile: ${(error as Error).message}`);
    res.status(500).json({ error: 'Failed to read shapefile' });
  }
});

// Download shapefile
app.get('/api/v1/gis/shape-files/:id/download', (req, res) => {
  const shapeFile = shapeFileStore.find(sf => sf.id === req.params.id);
  if (!shapeFile) {
    return res.status(404).json({ error: 'Shapefile not found' });
  }

  if (!fs.existsSync(shapeFile.file_path)) {
    return res.status(404).json({ error: 'File not found on server' });
  }

  const ext = path.extname(shapeFile.file_path);
  const filename = `${shapeFile.name}${ext}`;
  
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  
  const fileStream = fs.createReadStream(shapeFile.file_path);
  fileStream.pipe(res);
});

// ============ AUTH ENDPOINTS - Proxied to Laravel ============
// Auth endpoints are handled by Laravel backend via proxy
// See: api/routes/api.php for actual auth implementation

// 2FA, password reset endpoints are handled by Laravel backend via proxy

app.post('/api/v1/auth/password/reset-mock', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }
  res.json({ message: 'Password has been reset successfully' });
});

const registeredUsers: Array<{ id: string; name: string; email: string; organization?: string }> = [];

app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password, organization } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  
  if (registeredUsers.some(u => u.email === email)) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }
  
  const newUser = {
    id: String(registeredUsers.length + 100),
    name,
    email,
    organization,
  };
  registeredUsers.push(newUser);
  
  res.json({ 
    message: 'Account created successfully',
    user: { ...newUser, current_tenant_id: '1', two_factor_enabled: false, roles: ['user'], permissions: [] }
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

// Project Milestones
const milestonesStore = [
  { id: '1', project_id: '1', name: 'Design Approval', description: 'Complete engineering design and obtain regulatory approval', planned_date: '2024-07-15', actual_date: '2024-07-20', status: 'completed', weight: 15, dependencies: null, deliverables: 'Approved design documents', created_at: '2024-06-01' },
  { id: '2', project_id: '1', name: 'Procurement Complete', description: 'Complete all procurement processes', planned_date: '2024-09-01', actual_date: '2024-09-15', status: 'completed', weight: 20, dependencies: '1', deliverables: 'Signed contracts', created_at: '2024-06-01' },
  { id: '3', project_id: '1', name: 'Pipeline Installation 50%', description: 'Complete 50% of pipeline installation', planned_date: '2024-12-01', actual_date: null, status: 'in_progress', weight: 25, dependencies: '2', deliverables: 'Installation progress report', created_at: '2024-06-01' },
  { id: '4', project_id: '1', name: 'Testing & Commissioning', description: 'Complete pressure testing and commissioning', planned_date: '2025-04-01', actual_date: null, status: 'pending', weight: 20, dependencies: '3', deliverables: 'Test certificates', created_at: '2024-06-01' },
  { id: '5', project_id: '1', name: 'Handover', description: 'Complete project handover to operations', planned_date: '2025-06-01', actual_date: null, status: 'pending', weight: 20, dependencies: '4', deliverables: 'Handover documentation', created_at: '2024-06-01' },
  { id: '6', project_id: '2', name: 'Environmental Assessment', description: 'Complete EIA and obtain NEMA approval', planned_date: '2024-10-15', actual_date: '2024-10-20', status: 'completed', weight: 10, dependencies: null, deliverables: 'EIA Report', created_at: '2024-08-01' },
  { id: '7', project_id: '2', name: 'Civil Works Start', description: 'Begin civil works construction', planned_date: '2024-11-01', actual_date: '2024-11-10', status: 'completed', weight: 15, dependencies: '6', deliverables: 'Site mobilization', created_at: '2024-08-01' },
];

app.get('/api/v1/projects/:id/milestones', (req, res) => {
  res.json({ data: milestonesStore.filter(m => m.project_id === req.params.id) });
});

app.post('/api/v1/projects/:id/milestones', (req, res) => {
  const { name, description, planned_date, weight } = req.body;
  const newMilestone = { id: String(milestonesStore.length + 1), project_id: req.params.id, name, description, planned_date, actual_date: null, status: 'pending', weight: weight || 10, dependencies: null, deliverables: null, created_at: new Date().toISOString().split('T')[0] };
  milestonesStore.push(newMilestone);
  res.json({ data: newMilestone });
});

app.patch('/api/v1/projects/:id/milestones/:milestoneId', (req, res) => {
  const idx = milestonesStore.findIndex(m => m.id === req.params.milestoneId && m.project_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Milestone not found' });
  milestonesStore[idx] = { ...milestonesStore[idx], ...req.body };
  res.json({ data: milestonesStore[idx] });
});

// Project Procurement & Contracts
const procurementStore = [
  { id: '1', project_id: '1', tender_no: 'TND-2024-001', title: 'Supply of 900mm DI Pipes', description: 'Supply and delivery of ductile iron pipes', method: 'open_tender', estimated_value: 8500000, contract_value: 8200000, contractor: 'Kenya Pipeline Supplies Ltd', contractor_contact: '+254712345678', status: 'awarded', publish_date: '2024-07-01', closing_date: '2024-07-31', award_date: '2024-08-15', contract_start: '2024-09-01', contract_end: '2025-03-01', performance_bond: 820000, retention: 5, created_at: '2024-07-01' },
  { id: '2', project_id: '1', tender_no: 'TND-2024-002', title: 'Pipeline Installation Works', description: 'Civil and mechanical works for pipeline installation', method: 'open_tender', estimated_value: 4500000, contract_value: 4350000, contractor: 'AquaWorks Construction', contractor_contact: '+254723456789', status: 'in_progress', publish_date: '2024-08-01', closing_date: '2024-08-31', award_date: '2024-09-15', contract_start: '2024-10-01', contract_end: '2025-04-01', performance_bond: 435000, retention: 10, created_at: '2024-08-01' },
  { id: '3', project_id: '2', tender_no: 'TND-2024-003', title: 'Treatment Plant Equipment', description: 'Supply of filtration and chemical dosing equipment', method: 'restricted_tender', estimated_value: 45000000, contract_value: null, contractor: null, contractor_contact: null, status: 'evaluation', publish_date: '2024-09-15', closing_date: '2024-10-15', award_date: null, contract_start: null, contract_end: null, performance_bond: null, retention: null, created_at: '2024-09-15' },
  { id: '4', project_id: '4', tender_no: 'TND-2023-015', title: 'Reservoir Civil Works', description: 'Construction of 5000m3 reinforced concrete reservoir', method: 'open_tender', estimated_value: 32000000, contract_value: 31500000, contractor: 'BuildRight Engineers', contractor_contact: '+254734567890', status: 'completed', publish_date: '2023-02-01', closing_date: '2023-03-01', award_date: '2023-03-20', contract_start: '2023-04-01', contract_end: '2024-10-01', performance_bond: 3150000, retention: 10, created_at: '2023-02-01' },
];

app.get('/api/v1/projects/:id/procurement', (req, res) => {
  res.json({ data: procurementStore.filter(p => p.project_id === req.params.id) });
});

app.get('/api/v1/procurement', (req, res) => {
  res.json({ data: procurementStore });
});

app.get('/api/v1/procurement/dashboard', (req, res) => {
  res.json({ data: {
    total_tenders: procurementStore.length,
    active: procurementStore.filter(p => ['published', 'evaluation', 'in_progress'].includes(p.status)).length,
    awarded_value: procurementStore.filter(p => p.contract_value).reduce((sum, p) => sum + (p.contract_value || 0), 0),
    pending_evaluation: procurementStore.filter(p => p.status === 'evaluation').length,
    expiring_contracts: 1
  }});
});

app.post('/api/v1/projects/:id/procurement', (req, res) => {
  const { title, description, method, estimated_value, closing_date } = req.body;
  const newTender = { id: String(procurementStore.length + 1), project_id: req.params.id, tender_no: `TND-2024-${String(procurementStore.length + 1).padStart(3, '0')}`, title, description, method: method || 'open_tender', estimated_value, contract_value: null, contractor: null, contractor_contact: null, status: 'draft', publish_date: null, closing_date, award_date: null, contract_start: null, contract_end: null, performance_bond: null, retention: null, created_at: new Date().toISOString().split('T')[0] };
  procurementStore.push(newTender);
  res.json({ data: newTender });
});

// Project Risks & Issues
const risksStore = [
  { id: '1', project_id: '1', risk_no: 'RSK-001', title: 'Land Acquisition Delays', description: 'Potential delays in acquiring wayleaves from landowners', category: 'schedule', probability: 'high', impact: 'high', risk_score: 9, status: 'mitigated', mitigation: 'Early engagement with landowners, alternative routing options identified', owner: 'Project Manager', identified_date: '2024-06-15', review_date: '2024-11-15', created_at: '2024-06-15' },
  { id: '2', project_id: '1', risk_no: 'RSK-002', title: 'Material Price Escalation', description: 'Steel and pipe prices may increase due to global market conditions', category: 'cost', probability: 'medium', impact: 'medium', risk_score: 6, status: 'monitoring', mitigation: 'Price variation clause in contracts, bulk procurement strategy', owner: 'Procurement Officer', identified_date: '2024-07-01', review_date: '2024-12-01', created_at: '2024-07-01' },
  { id: '3', project_id: '1', risk_no: 'RSK-003', title: 'Contractor Capacity', description: 'Contractor may face resource constraints during peak season', category: 'technical', probability: 'low', impact: 'high', risk_score: 4, status: 'open', mitigation: 'Regular progress monitoring, backup contractor identified', owner: 'Site Engineer', identified_date: '2024-09-01', review_date: '2025-01-01', created_at: '2024-09-01' },
  { id: '4', project_id: '2', risk_no: 'RSK-004', title: 'Environmental Compliance', description: 'Risk of environmental permit delays or additional requirements', category: 'regulatory', probability: 'medium', impact: 'high', risk_score: 7, status: 'mitigated', mitigation: 'Early NEMA engagement, comprehensive EIA completed', owner: 'Environmental Officer', identified_date: '2024-08-15', review_date: '2024-11-30', created_at: '2024-08-15' },
];

const issuesStore = [
  { id: '1', project_id: '1', issue_no: 'ISS-001', title: 'Pipe Delivery Delay', description: 'Supplier delayed delivery of 200m pipe section by 2 weeks', category: 'procurement', priority: 'high', status: 'resolved', resolution: 'Expedited shipping arranged, schedule adjusted', assigned_to: 'Procurement Officer', reported_date: '2024-10-15', resolved_date: '2024-10-28', created_at: '2024-10-15' },
  { id: '2', project_id: '1', issue_no: 'ISS-002', title: 'Underground Utility Conflict', description: 'Discovered unmarked fiber optic cables during excavation', category: 'technical', priority: 'medium', status: 'in_progress', resolution: null, assigned_to: 'Site Engineer', reported_date: '2024-11-10', resolved_date: null, created_at: '2024-11-10' },
  { id: '3', project_id: '4', issue_no: 'ISS-003', title: 'Quality Concern - Concrete', description: 'Concrete cube test results below specification', category: 'quality', priority: 'critical', status: 'resolved', resolution: 'Affected section demolished and recast, supplier changed', assigned_to: 'Quality Engineer', reported_date: '2023-08-20', resolved_date: '2023-09-15', created_at: '2023-08-20' },
];

app.get('/api/v1/projects/:id/risks', (req, res) => {
  res.json({ data: risksStore.filter(r => r.project_id === req.params.id) });
});

app.get('/api/v1/projects/:id/issues', (req, res) => {
  res.json({ data: issuesStore.filter(i => i.project_id === req.params.id) });
});

app.post('/api/v1/projects/:id/risks', (req, res) => {
  const { title, description, category, probability, impact, mitigation, owner } = req.body;
  const scores: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const risk_score = (scores[probability] || 2) * (scores[impact] || 2);
  const newRisk = { id: String(risksStore.length + 1), project_id: req.params.id, risk_no: `RSK-${String(risksStore.length + 1).padStart(3, '0')}`, title, description, category, probability, impact, risk_score, status: 'open', mitigation, owner, identified_date: new Date().toISOString().split('T')[0], review_date: null, created_at: new Date().toISOString().split('T')[0] };
  risksStore.push(newRisk);
  res.json({ data: newRisk });
});

app.post('/api/v1/projects/:id/issues', (req, res) => {
  const { title, description, category, priority, assigned_to } = req.body;
  const newIssue = { id: String(issuesStore.length + 1), project_id: req.params.id, issue_no: `ISS-${String(issuesStore.length + 1).padStart(3, '0')}`, title, description, category, priority, status: 'open', resolution: null, assigned_to, reported_date: new Date().toISOString().split('T')[0], resolved_date: null, created_at: new Date().toISOString().split('T')[0] };
  issuesStore.push(newIssue);
  res.json({ data: newIssue });
});

// Project Documents & Communications
const documentsStore = [
  { id: '1', project_id: '1', doc_no: 'DOC-001', title: 'Detailed Engineering Design', description: 'Complete engineering design package', category: 'design', file_type: 'pdf', file_size: 15600000, version: '2.1', status: 'approved', uploaded_by: 'Eng. James Mwangi', approved_by: 'Chief Engineer', approved_date: '2024-07-15', created_at: '2024-06-20' },
  { id: '2', project_id: '1', doc_no: 'DOC-002', title: 'Bill of Quantities', description: 'Priced BOQ for all works', category: 'procurement', file_type: 'xlsx', file_size: 2500000, version: '1.3', status: 'approved', uploaded_by: 'QS Mary Wanjiku', approved_by: 'Finance Manager', approved_date: '2024-07-20', created_at: '2024-07-01' },
  { id: '3', project_id: '1', doc_no: 'DOC-003', title: 'Monthly Progress Report - Oct 2024', description: 'October 2024 progress report', category: 'report', file_type: 'pdf', file_size: 8900000, version: '1.0', status: 'final', uploaded_by: 'Project Manager', approved_by: null, approved_date: null, created_at: '2024-11-05' },
  { id: '4', project_id: '1', doc_no: 'DOC-004', title: 'Site Meeting Minutes #12', description: 'Minutes of 12th site coordination meeting', category: 'correspondence', file_type: 'docx', file_size: 450000, version: '1.0', status: 'final', uploaded_by: 'Site Clerk', approved_by: null, approved_date: null, created_at: '2024-11-18' },
  { id: '5', project_id: '2', doc_no: 'DOC-005', title: 'Environmental Impact Assessment', description: 'Full EIA report with NEMA approval', category: 'regulatory', file_type: 'pdf', file_size: 25000000, version: '1.0', status: 'approved', uploaded_by: 'Environmental Officer', approved_by: 'NEMA', approved_date: '2024-10-20', created_at: '2024-09-01' },
];

const communicationsStore = [
  { id: '1', project_id: '1', comm_no: 'COM-001', subject: 'Project Kickoff Meeting Invitation', message: 'You are invited to attend the project kickoff meeting scheduled for...', sender: 'Project Manager', recipients: ['Contractor', 'Consultant', 'Client Rep'], comm_type: 'meeting_invite', status: 'sent', sent_date: '2024-06-25', response_required: true, response_deadline: '2024-06-28', created_at: '2024-06-25' },
  { id: '2', project_id: '1', comm_no: 'COM-002', subject: 'Request for Variation Approval', message: 'We request approval for variation order VO-001 regarding...', sender: 'Contractor', recipients: ['Project Manager', 'Client Rep'], comm_type: 'request', status: 'responded', sent_date: '2024-10-10', response_required: true, response_deadline: '2024-10-17', created_at: '2024-10-10' },
  { id: '3', project_id: '1', comm_no: 'COM-003', subject: 'Progress Update - Week 45', message: 'Weekly progress update: Pipeline installation at 48% complete...', sender: 'Site Engineer', recipients: ['Project Manager', 'Stakeholders'], comm_type: 'update', status: 'sent', sent_date: '2024-11-15', response_required: false, response_deadline: null, created_at: '2024-11-15' },
];

app.get('/api/v1/projects/:id/documents', (req, res) => {
  res.json({ data: documentsStore.filter(d => d.project_id === req.params.id) });
});

app.get('/api/v1/projects/:id/communications', (req, res) => {
  res.json({ data: communicationsStore.filter(c => c.project_id === req.params.id) });
});

app.post('/api/v1/projects/:id/documents', (req, res) => {
  const { title, description, category, file_type } = req.body;
  const newDoc = { id: String(documentsStore.length + 1), project_id: req.params.id, doc_no: `DOC-${String(documentsStore.length + 1).padStart(3, '0')}`, title, description, category, file_type: file_type || 'pdf', file_size: 1000000, version: '1.0', status: 'draft', uploaded_by: 'Demo User', approved_by: null, approved_date: null, created_at: new Date().toISOString().split('T')[0] };
  documentsStore.push(newDoc);
  res.json({ data: newDoc });
});

app.post('/api/v1/projects/:id/communications', (req, res) => {
  const { subject, message, recipients, comm_type, response_required } = req.body;
  const newComm = { id: String(communicationsStore.length + 1), project_id: req.params.id, comm_no: `COM-${String(communicationsStore.length + 1).padStart(3, '0')}`, subject, message, sender: 'Demo User', recipients: recipients || [], comm_type: comm_type || 'general', status: 'draft', sent_date: null, response_required: response_required || false, response_deadline: null, created_at: new Date().toISOString().split('T')[0] };
  communicationsStore.push(newComm);
  res.json({ data: newComm });
});

// Project GIS Data
const projectLocationsStore = [
  { id: '1', project_id: '1', name: 'Pipeline Route Start', lat: -1.2864, lng: 36.8172, location_type: 'start_point', description: 'Pipeline starting point at Nairobi CBD' },
  { id: '2', project_id: '1', name: 'Pipeline Route End', lat: -1.2200, lng: 36.8800, location_type: 'end_point', description: 'Pipeline ending point at residential area' },
  { id: '3', project_id: '2', name: 'Treatment Plant Site', lat: -4.0435, lng: 39.6682, location_type: 'facility', description: 'Mombasa treatment plant location' },
  { id: '4', project_id: '4', name: 'Reservoir Site', lat: -0.3031, lng: 36.0800, location_type: 'facility', description: 'Nakuru reservoir construction site' },
];

app.get('/api/v1/projects/:id/locations', (req, res) => {
  res.json({ data: projectLocationsStore.filter(l => l.project_id === req.params.id) });
});

app.get('/api/v1/projects/map/all', (req, res) => {
  const projectsWithLocations = projectsStore.map(p => ({
    ...p,
    locations: projectLocationsStore.filter(l => l.project_id === p.id)
  })).filter(p => p.locations.length > 0);
  res.json({ data: projectsWithLocations });
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

// ============ STAKEHOLDER MAPPING ============
app.get('/api/v1/community/stakeholders', (req, res) => {
  res.json({ data: [
    { id: 1, name: 'County Water Director', category: 'Government', influence: 5, interest: 5, engagement: 'monthly', lastEngagement: '2025-11-20', status: 'active', isVulnerable: false },
    { id: 2, name: 'Community Chairperson', category: 'Community', influence: 4, interest: 5, engagement: 'bi-weekly', lastEngagement: '2025-11-18', status: 'active', isVulnerable: false },
    { id: 3, name: 'Water Users Association', category: 'Users', influence: 3, interest: 4, engagement: 'quarterly', lastEngagement: '2025-10-15', status: 'active', isVulnerable: false },
    { id: 4, name: 'NGO Partner', category: 'NGO', influence: 3, interest: 4, engagement: 'monthly', lastEngagement: '2025-11-15', status: 'active', isVulnerable: false },
    { id: 5, name: 'Women Vendors Group', category: 'Vulnerable', influence: 2, interest: 5, engagement: 'bi-weekly', lastEngagement: '2025-11-22', status: 'active', isVulnerable: true, vulnerableReason: 'Economic disadvantage' },
    { id: 6, name: 'Elderly Residents Committee', category: 'Vulnerable', influence: 2, interest: 4, engagement: 'monthly', lastEngagement: '2025-11-10', status: 'active', isVulnerable: true, vulnerableReason: 'Mobility challenges' },
    { id: 7, name: 'Ministry of Water', category: 'Government', influence: 5, interest: 3, engagement: 'quarterly', lastEngagement: '2025-09-15', status: 'active', isVulnerable: false },
    { id: 8, name: 'Private Sector Partner', category: 'Private', influence: 4, interest: 3, engagement: 'quarterly', lastEngagement: '2025-10-20', status: 'active', isVulnerable: false },
  ]});
});

app.get('/api/v1/community/stakeholder-matrix', (req, res) => {
  res.json({ data: {
    champions: 32,
    keysupporters: 65,
    neutral: 85,
    resistors: 38,
    vulnerable: 18,
    highInfluenceHighInterest: 32,
    highInfluenceLowInterest: 28,
    lowInfluenceHighInterest: 65,
    lowInfluenceLowInterest: 120,
  }});
});

app.get('/api/v1/community/engagement-history', (req, res) => {
  res.json({ data: [
    { id: 1, stakeholderId: 1, type: 'meeting', date: '2025-11-20', outcome: 'positive', notes: 'Discussed water quality monitoring' },
    { id: 2, stakeholderId: 2, type: 'consultation', date: '2025-11-18', outcome: 'positive', notes: 'Community feedback on tariff increase' },
    { id: 3, stakeholderId: 5, type: 'focus_group', date: '2025-11-22', outcome: 'positive', notes: 'Women vendors water access program' },
    { id: 4, stakeholderId: 6, type: 'survey', date: '2025-11-10', outcome: 'neutral', notes: 'Elderly access needs assessment' },
    { id: 5, stakeholderId: 7, type: 'presentation', date: '2025-09-15', outcome: 'positive', notes: 'Quarterly progress report' },
  ]});
});

// ============ ENGAGEMENT PLANNER EVENTS ============
let eventCounter = 8;
const eventStore = [
  { id: 1, title: 'Community Baraza - Water Tariff Review', type: 'baraza', date: '2025-12-05', time: '10:00', location: 'Elwak Community Hall', description: 'Quarterly tariff review discussion with community leaders', expectedAttendance: 150, actualAttendance: null, status: 'upcoming', stakeholderGroups: ['Community', 'Government'], qrCode: 'EVT-001-2025' },
  { id: 2, title: 'Women Vendors Focus Group', type: 'focus_group', date: '2025-12-08', time: '14:00', location: 'Market Center Meeting Room', description: 'Access needs assessment for women water vendors', expectedAttendance: 30, actualAttendance: null, status: 'upcoming', stakeholderGroups: ['Vulnerable'], qrCode: 'EVT-002-2025' },
  { id: 3, title: 'NGO Partners Coordination Meeting', type: 'meeting', date: '2025-12-10', time: '09:00', location: 'County Water Office', description: 'Monthly coordination with NGO partners', expectedAttendance: 15, actualAttendance: null, status: 'upcoming', stakeholderGroups: ['NGO'], qrCode: 'EVT-003-2025' },
  { id: 4, title: 'Youth Water Conservation Workshop', type: 'workshop', date: '2025-12-12', time: '11:00', location: 'Merti Secondary School', description: 'Water conservation awareness for youth groups', expectedAttendance: 80, actualAttendance: null, status: 'upcoming', stakeholderGroups: ['Community', 'Users'], qrCode: 'EVT-004-2025' },
  { id: 5, title: 'Quarterly Progress Review', type: 'presentation', date: '2025-12-15', time: '10:00', location: 'Ministry of Water Conference Room', description: 'Q4 progress presentation to government stakeholders', expectedAttendance: 25, actualAttendance: null, status: 'upcoming', stakeholderGroups: ['Government'], qrCode: 'EVT-005-2025' },
  { id: 6, title: 'Community Baraza - Infrastructure Update', type: 'baraza', date: '2025-11-15', time: '10:00', location: 'Elwak Community Hall', description: 'Update on ongoing infrastructure projects', expectedAttendance: 120, actualAttendance: 135, status: 'completed', stakeholderGroups: ['Community', 'Government'], qrCode: 'EVT-006-2025' },
  { id: 7, title: 'Elderly Access Consultation', type: 'consultation', date: '2025-11-10', time: '14:00', location: 'Community Center', description: 'Special consultation on elderly water access needs', expectedAttendance: 40, actualAttendance: 38, status: 'completed', stakeholderGroups: ['Vulnerable'], qrCode: 'EVT-007-2025' },
  { id: 8, title: 'Private Sector Partnership Discussion', type: 'meeting', date: '2025-11-20', time: '09:00', location: 'County Water Office', description: 'Exploring PPP opportunities', expectedAttendance: 12, actualAttendance: 10, status: 'completed', stakeholderGroups: ['Private', 'Government'], qrCode: 'EVT-008-2025' },
];

const attendanceStore: Record<number, Array<{ id: number; name: string; organization: string; phone: string; checkedIn: boolean; checkinTime: string | null }>> = {
  6: [
    { id: 1, name: 'John Mwangi', organization: 'Elwak Community', phone: '+254712345678', checkedIn: true, checkinTime: '09:45' },
    { id: 2, name: 'Mary Atieno', organization: 'Women Group', phone: '+254723456789', checkedIn: true, checkinTime: '09:50' },
    { id: 3, name: 'James Kipchoge', organization: 'County Water Dept', phone: '+254734567890', checkedIn: true, checkinTime: '09:55' },
  ],
  7: [
    { id: 1, name: 'Grace Wanjiku', organization: 'Elderly Association', phone: '+254745678901', checkedIn: true, checkinTime: '13:55' },
    { id: 2, name: 'Peter Ochieng', organization: 'Community Health', phone: '+254756789012', checkedIn: true, checkinTime: '14:05' },
  ],
  8: [
    { id: 1, name: 'Sarah Kimani', organization: 'Private Water Co.', phone: '+254767890123', checkedIn: true, checkinTime: '08:55' },
    { id: 2, name: 'David Mutua', organization: 'County Government', phone: '+254778901234', checkedIn: true, checkinTime: '09:00' },
  ],
};

app.get('/api/v1/community/events', (req, res) => {
  res.json({ data: eventStore });
});

app.get('/api/v1/community/events/:id', (req, res) => {
  const event = eventStore.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ data: event });
});

app.post('/api/v1/community/events', (req, res) => {
  const newEvent = {
    id: ++eventCounter,
    ...req.body,
    qrCode: `EVT-${String(eventCounter).padStart(3, '0')}-2025`,
    status: 'upcoming',
    actualAttendance: null,
  };
  eventStore.push(newEvent);
  res.json({ data: newEvent, message: 'Event created successfully' });
});

app.put('/api/v1/community/events/:id', (req, res) => {
  const index = eventStore.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Event not found' });
  eventStore[index] = { ...eventStore[index], ...req.body };
  res.json({ data: eventStore[index], message: 'Event updated successfully' });
});

app.get('/api/v1/community/events/:id/attendance', (req, res) => {
  const eventId = parseInt(req.params.id);
  const attendance = attendanceStore[eventId] || [];
  res.json({ data: attendance });
});

app.post('/api/v1/community/events/:id/checkin', (req, res) => {
  const eventId = parseInt(req.params.id);
  const { name, organization, phone } = req.body;
  if (!attendanceStore[eventId]) attendanceStore[eventId] = [];
  const newAttendee = {
    id: attendanceStore[eventId].length + 1,
    name,
    organization,
    phone,
    checkedIn: true,
    checkinTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
  attendanceStore[eventId].push(newAttendee);
  res.json({ data: newAttendee, message: 'Check-in successful' });
});

app.get('/api/v1/community/events/stats/summary', (req, res) => {
  const upcoming = eventStore.filter(e => e.status === 'upcoming').length;
  const completed = eventStore.filter(e => e.status === 'completed').length;
  const totalAttendance = eventStore.reduce((sum, e) => sum + (e.actualAttendance || 0), 0);
  res.json({ data: { upcoming, completed, totalAttendance } });
});

// ============ OPERATIONS DASHBOARD & MONITORING ============
const dashboardData = {
  kpis: {
    outages_count: 2,
    schedules_count: 3,
    dose_plans_count: 2
  },
  active_outages: [
    { id: 1, code: 'OUT-001', state: 'live', cause: 'planned', summary: 'Scheduled maintenance Zone A', scheme: { id: 1, name: 'Elwak Scheme' }, starts_at: new Date(Date.now() - 3600000).toISOString(), ends_at: new Date(Date.now() + 7200000).toISOString(), estimated_customers_affected: 2500 },
    { id: 2, code: 'OUT-002', state: 'approved', cause: 'fault', summary: 'Pump failure at Merti station', scheme: { id: 2, name: 'Merti Scheme' }, starts_at: new Date(Date.now() + 1800000).toISOString(), estimated_customers_affected: 1800 }
  ],
  active_schedules: [
    { id: 1, status: 'running', start_at: new Date(Date.now() - 1800000).toISOString(), end_at: new Date(Date.now() + 3600000).toISOString(), target_volume_m3: 5000, asset: { id: 1, name: 'Main Pump 1', code: 'PUMP-001' }, scheme: { id: 1, name: 'Elwak Scheme' } },
    { id: 2, status: 'scheduled', start_at: new Date(Date.now() + 7200000).toISOString(), end_at: new Date(Date.now() + 14400000).toISOString(), target_volume_m3: 3000, asset: { id: 2, name: 'Backup Pump', code: 'PUMP-002' }, scheme: { id: 2, name: 'Merti Scheme' } },
    { id: 3, status: 'running', start_at: new Date(Date.now() - 3600000).toISOString(), end_at: new Date(Date.now() + 7200000).toISOString(), target_volume_m3: 8000, asset: { id: 3, name: 'Distribution Pump', code: 'PUMP-003' }, scheme: { id: 1, name: 'Elwak Scheme' } }
  ],
  active_dose_plans: [
    { id: 1, asset: { id: 1, name: 'Treatment Plant A', code: 'TP-001' }, scheme: { id: 1, name: 'Elwak Scheme' }, chemical: 'Chlorine' },
    { id: 2, asset: { id: 2, name: 'Treatment Plant B', code: 'TP-002' }, scheme: { id: 2, name: 'Merti Scheme' }, chemical: 'Alum' }
  ],
  alarm_tags: [
    { id: 1, tag_name: 'Reservoir_Level_Zone_A', data_type: 'float', unit: 'm', scheme: { id: 1, name: 'Elwak Scheme' }, thresholds: { warning: 5, critical: 2 } },
    { id: 2, tag_name: 'Pump_Pressure_Zone_B', data_type: 'float', unit: 'bar', asset: { id: 1, name: 'Main Pump 1', code: 'PUMP-001' }, thresholds: { warning: 5, critical: 8 } },
    { id: 3, tag_name: 'Water_Quality_TDS', data_type: 'float', unit: 'ppm', facility: { id: 1, name: 'Treatment Plant A' }, thresholds: { warning: 400, critical: 500 } }
  ]
};

app.get('/api/v1/core-ops/dashboard', (req, res) => {
  res.json(dashboardData);
});

app.get('/api/v1/operations/dashboard', (req, res) => {
  res.json(dashboardData);
});

// SSE endpoint for real-time alarms
const clients: Set<Response> = new Set();
app.get('/api/v1/console/alarms', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  clients.add(res);
  console.log('SSE client connected, total clients:', clients.size);

  // Send initial connection message
  res.write('data: {"type":"connected","message":"Connected to alarm stream"}\n\n');

  // Send periodic test alarms every 10 seconds
  const alarmInterval = setInterval(() => {
    const alarmTemplates = [
      { id: '1', tag_name: 'Reservoir_Level_Zone_A', severity: 'warning', message: 'Low reservoir level', value: 35, threshold: 50 },
      { id: '2', tag_name: 'Pump_Pressure_Zone_B', severity: 'critical', message: 'High pressure detected', value: 8.5, threshold: 6 },
      { id: '3', tag_name: 'Water_Quality_TDS', severity: 'info', message: 'TDS reading normal', value: 250, threshold: 500 },
    ];
    const template = alarmTemplates[Math.floor(Math.random() * alarmTemplates.length)];
    const alarm = { ...template, timestamp: new Date().toISOString() };
    res.write(`data: ${JSON.stringify(alarm)}\n\n`);
  }, 10000);

  res.on('close', () => {
    clients.delete(res);
    clearInterval(alarmInterval);
    console.log('SSE client disconnected, remaining clients:', clients.size);
  });
});

// ============ CORE-OPS MODULE ENDPOINTS ============
// Pump Scheduling
app.get('/api/v1/core-ops/schedule', (req, res) => {
  res.json({
    data: [
      { id: 1, status: 'running', start_at: new Date(Date.now() - 1800000).toISOString(), end_at: new Date(Date.now() + 3600000).toISOString(), target_volume_m3: 5000, actual_volume_m3: 2800, asset: { id: 1, name: 'Main Pump 1', code: 'PUMP-001' }, scheme: { id: 1, name: 'Elwak Scheme' }, energy_kwh: 45.2, notes: 'Morning shift pumping' },
      { id: 2, status: 'scheduled', start_at: new Date(Date.now() + 7200000).toISOString(), end_at: new Date(Date.now() + 14400000).toISOString(), target_volume_m3: 3000, actual_volume_m3: null, asset: { id: 2, name: 'Backup Pump', code: 'PUMP-002' }, scheme: { id: 2, name: 'Merti Scheme' }, energy_kwh: null, notes: 'Scheduled backup operation' },
      { id: 3, status: 'running', start_at: new Date(Date.now() - 3600000).toISOString(), end_at: new Date(Date.now() + 7200000).toISOString(), target_volume_m3: 8000, actual_volume_m3: 5200, asset: { id: 3, name: 'Distribution Pump', code: 'PUMP-003' }, scheme: { id: 1, name: 'Elwak Scheme' }, energy_kwh: 78.5, notes: 'Distribution zone supply' },
      { id: 4, status: 'completed', start_at: new Date(Date.now() - 10800000).toISOString(), end_at: new Date(Date.now() - 7200000).toISOString(), target_volume_m3: 4000, actual_volume_m3: 4150, asset: { id: 1, name: 'Main Pump 1', code: 'PUMP-001' }, scheme: { id: 1, name: 'Elwak Scheme' }, energy_kwh: 52.1, notes: 'Night shift completed' }
    ],
    meta: { total: 4, per_page: 100, current_page: 1 }
  });
});

app.post('/api/v1/core-ops/schedule', (req, res) => {
  res.json({ data: { id: 5, ...req.body, status: 'scheduled' }, message: 'Schedule created successfully' });
});

// Dosing Plans
app.get('/api/v1/core-ops/dosing/plans', (req, res) => {
  res.json({
    data: [
      { id: 1, status: 'active', chemical: 'Chlorine', target_dose_mg_l: 0.8, current_dose_mg_l: 0.75, asset: { id: 1, name: 'Treatment Plant A', code: 'TP-001' }, scheme: { id: 1, name: 'Elwak Scheme' }, start_date: '2025-01-01', end_date: null },
      { id: 2, status: 'active', chemical: 'Alum', target_dose_mg_l: 15, current_dose_mg_l: 14.5, asset: { id: 2, name: 'Treatment Plant B', code: 'TP-002' }, scheme: { id: 2, name: 'Merti Scheme' }, start_date: '2025-01-01', end_date: null }
    ],
    meta: { total: 2, per_page: 50, current_page: 1 }
  });
});

// NRW Snapshots
app.get('/api/v1/core-ops/nrw/snapshots', (req, res) => {
  res.json({
    data: [
      { id: 1, dma: { id: 1, name: 'Zone A' }, as_of: '2025-11-25T00:00:00.000Z', system_input_volume_m3: 50000, nrw_m3: 11500, nrw_pct: 23, billed_authorized_m3: 38500, unbilled_authorized_m3: 500, apparent_losses_m3: 3500, real_losses_m3: 8000 },
      { id: 2, dma: { id: 2, name: 'Zone B' }, as_of: '2025-11-25T00:00:00.000Z', system_input_volume_m3: 35000, nrw_m3: 6300, nrw_pct: 18, billed_authorized_m3: 28700, unbilled_authorized_m3: 300, apparent_losses_m3: 2100, real_losses_m3: 4200 },
      { id: 3, dma: { id: 3, name: 'Zone C' }, as_of: '2025-11-25T00:00:00.000Z', system_input_volume_m3: 28000, nrw_m3: 8400, nrw_pct: 30, billed_authorized_m3: 19600, unbilled_authorized_m3: 200, apparent_losses_m3: 2800, real_losses_m3: 5600 }
    ],
    meta: { total: 3, per_page: 50, current_page: 1 }
  });
});

// Network Nodes
app.get('/api/v1/core-ops/network/nodes', (req, res) => {
  res.json({
    data: [
      { id: 1, code: 'NODE-001', name: 'Main Reservoir', node_type: 'reservoir', elevation_m: 1250, capacity_m3: 5000, scheme: { id: 1, name: 'Elwak Scheme' }, lat: -1.2921, lng: 36.8219 },
      { id: 2, code: 'NODE-002', name: 'Pump Station 1', node_type: 'pump_station', elevation_m: 1180, capacity_m3: null, scheme: { id: 1, name: 'Elwak Scheme' }, lat: -1.2850, lng: 36.8150 },
      { id: 3, code: 'NODE-003', name: 'Junction A', node_type: 'junction', elevation_m: 1200, capacity_m3: null, scheme: { id: 1, name: 'Elwak Scheme' }, lat: -1.2800, lng: 36.8100 }
    ],
    meta: { total: 3, per_page: 50, current_page: 1 }
  });
});

// Network Edges
app.get('/api/v1/core-ops/network/edges', (req, res) => {
  res.json({
    data: [
      { id: 1, from_node: { id: 1, name: 'Main Reservoir' }, to_node: { id: 2, name: 'Pump Station 1' }, edge_type: 'transmission', length_m: 2500, diameter_mm: 300, material: 'DI' },
      { id: 2, from_node: { id: 2, name: 'Pump Station 1' }, to_node: { id: 3, name: 'Junction A' }, edge_type: 'distribution', length_m: 1800, diameter_mm: 200, material: 'HDPE' }
    ],
    meta: { total: 2, per_page: 50, current_page: 1 }
  });
});

// Outages
app.get('/api/v1/core-ops/outages', (req, res) => {
  res.json({
    data: dashboardData.active_outages,
    meta: { total: 2, per_page: 50, current_page: 1 }
  });
});

// Dosing Stocks
app.get('/api/v1/core-ops/dosing/stocks', (req, res) => {
  res.json({
    data: [
      { id: 1, chemical: 'Chlorine', quantity_kg: 250, reorder_level_kg: 50, unit_cost: 85, supplier: 'ChemSupply Ltd', last_delivery: '2025-11-15' },
      { id: 2, chemical: 'Alum', quantity_kg: 500, reorder_level_kg: 100, unit_cost: 45, supplier: 'Water Chem Co', last_delivery: '2025-11-20' }
    ],
    meta: { total: 2, per_page: 50, current_page: 1 }
  });
});

// NRW Interventions
app.get('/api/v1/core-ops/nrw/interventions', (req, res) => {
  res.json({
    data: [
      { id: 1, type: 'leak_repair', dma: { id: 1, name: 'Zone A' }, description: 'Repaired major leak on main transmission line', savings_m3_day: 150, cost: 25000, date: '2025-11-10T00:00:00.000Z', status: 'completed' },
      { id: 2, type: 'meter_replacement', dma: { id: 2, name: 'Zone B' }, description: 'Replaced 45 faulty customer meters', savings_m3_day: 80, cost: 180000, date: '2025-11-18T00:00:00.000Z', status: 'completed' },
      { id: 3, type: 'pressure_management', dma: { id: 1, name: 'Zone A' }, description: 'Installed PRV at zone inlet', savings_m3_day: 200, cost: 45000, date: '2025-11-25T00:00:00.000Z', status: 'in_progress' }
    ],
    meta: { total: 3, per_page: 50, current_page: 1 }
  });
});

// Telemetry Tags
app.get('/api/v1/core-ops/telemetry/tags', (req, res) => {
  res.json({
    data: dashboardData.alarm_tags,
    meta: { total: 3, per_page: 50, current_page: 1 }
  });
});

// Operations Shifts
app.get('/api/v1/operations/shifts', (req, res) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  res.json({
    data: [
      { id: '1', name: 'Morning Shift', starts_at: `${todayStr}T06:00:00Z`, ends_at: `${todayStr}T14:00:00Z`, status: 'active', supervisor: { id: 1, name: 'John Kamau' }, facility: { id: 1, name: 'Elwak Treatment Plant' }, entries_count: 12 },
      { id: '2', name: 'Afternoon Shift', starts_at: `${todayStr}T14:00:00Z`, ends_at: `${todayStr}T22:00:00Z`, status: 'planned', supervisor: { id: 2, name: 'Mary Wanjiku' }, facility: { id: 1, name: 'Elwak Treatment Plant' }, entries_count: 0 },
      { id: '3', name: 'Night Shift', starts_at: `${todayStr}T22:00:00Z`, ends_at: `${new Date(Date.now() + 86400000).toISOString().split('T')[0]}T06:00:00Z`, status: 'planned', supervisor: { id: 3, name: 'Peter Ochieng' }, facility: { id: 2, name: 'Merti Pumping Station' }, entries_count: 0 },
      { id: '4', name: 'Morning Shift', starts_at: `${new Date(Date.now() - 86400000).toISOString().split('T')[0]}T06:00:00Z`, ends_at: `${new Date(Date.now() - 86400000).toISOString().split('T')[0]}T14:00:00Z`, status: 'closed', supervisor: { id: 1, name: 'John Kamau' }, facility: { id: 1, name: 'Elwak Treatment Plant' }, entries_count: 18 }
    ],
    meta: { total: 4, per_page: 50, current_page: 1 }
  });
});

app.post('/api/v1/operations/shifts', (req, res) => {
  res.json({ data: { id: 5, ...req.body, status: 'scheduled' }, message: 'Shift created successfully' });
});

// DMAs endpoint
app.get('/api/v1/dmas', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Zone A', code: 'DMA-001', scheme: { id: 1, name: 'Elwak Scheme' }, connections: 1250, nrw_pct: 23 },
      { id: 2, name: 'Zone B', code: 'DMA-002', scheme: { id: 1, name: 'Elwak Scheme' }, connections: 980, nrw_pct: 18 },
      { id: 3, name: 'Zone C', code: 'DMA-003', scheme: { id: 2, name: 'Merti Scheme' }, connections: 650, nrw_pct: 30 }
    ],
    meta: { total: 3, per_page: 100, current_page: 1 }
  });
});

// PRV Targets endpoint
app.get('/api/v1/prv-targets', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'PRV Zone A Inlet', target_pressure_bar: 4.5, current_pressure_bar: 4.2, status: 'optimal', dma: { id: 1, name: 'Zone A' } },
      { id: 2, name: 'PRV Zone B Main', target_pressure_bar: 3.8, current_pressure_bar: 4.1, status: 'high', dma: { id: 2, name: 'Zone B' } }
    ],
    meta: { total: 2, per_page: 50, current_page: 1 }
  });
});

// Leak Suspicions endpoint
app.get('/api/v1/leak-suspicions', (req, res) => {
  res.json({
    data: [
      { id: 1, location: 'Main St & 2nd Ave', dma: { id: 1, name: 'Zone A' }, score: 0.85, detected_at: new Date(Date.now() - 172800000).toISOString(), status: 'investigating', estimated_loss_m3_day: 45 },
      { id: 2, location: 'Industrial Park Road', dma: { id: 2, name: 'Zone B' }, score: 0.72, detected_at: new Date(Date.now() - 86400000).toISOString(), status: 'confirmed', estimated_loss_m3_day: 120 }
    ],
    meta: { total: 2, per_page: 50, current_page: 1 }
  });
});

// Operations Checklists
app.get('/api/v1/operations/checklists', (req, res) => {
  res.json({
    data: [
      { id: '1', name: 'Daily Plant Inspection', description: 'Daily inspection checklist for treatment plant', category: 'maintenance', is_template: true, items: [{ id: 1, order: 1, text: 'Check pump pressure', required: true }, { id: 2, order: 2, text: 'Verify chlorine levels', required: true }], created_at: new Date().toISOString() },
      { id: '2', name: 'Weekly Safety Check', description: 'Weekly safety and compliance checklist', category: 'safety', is_template: true, items: [{ id: 1, order: 1, text: 'Inspect PPE', required: true }], created_at: new Date().toISOString() },
      { id: '3', name: 'Pump Station Inspection', description: 'Routine pump station inspection', category: 'equipment', is_template: true, items: [{ id: 1, order: 1, text: 'Check oil levels', required: true }], created_at: new Date().toISOString() }
    ],
    meta: { total: 3, per_page: 50, current_page: 1 }
  });
});

app.get('/api/v1/operations/checklist-runs', (req, res) => {
  res.json({
    data: [
      { id: '1', checklist_id: '1', checklist: { name: 'Daily Plant Inspection' }, started_at: new Date().toISOString(), status: 'in_progress', completed_items: 1, total_items: 2, started_by: { id: 1, name: 'John Kamau' } }
    ],
    meta: { total: 1, per_page: 50, current_page: 1 }
  });
});

app.post('/api/v1/operations/checklists', (req, res) => {
  res.json({ data: { id: '4', ...req.body, created_at: new Date().toISOString() }, message: 'Checklist created successfully' });
});

// Operations Playbooks
app.get('/api/v1/operations/playbooks', (req, res) => {
  res.json({
    data: [
      { id: '1', name: 'Pipe Burst Response', description: 'Standard procedure for responding to pipe bursts', trigger_event: 'pipe_burst', priority: 'high', steps: [{ order: 1, action: 'Isolate affected section' }, { order: 2, action: 'Notify customers' }], active: true, created_at: new Date().toISOString() },
      { id: '2', name: 'Low Pressure Alert', description: 'Response to low pressure alerts', trigger_event: 'low_pressure', priority: 'medium', steps: [{ order: 1, action: 'Check pump status' }], active: true, created_at: new Date().toISOString() },
      { id: '3', name: 'Contamination Response', description: 'Emergency contamination response', trigger_event: 'contamination', priority: 'critical', steps: [{ order: 1, action: 'Stop supply immediately' }], active: true, created_at: new Date().toISOString() }
    ],
    meta: { total: 3, per_page: 50, current_page: 1 }
  });
});

app.post('/api/v1/operations/playbooks', (req, res) => {
  res.json({ data: { id: '4', ...req.body, created_at: new Date().toISOString() }, message: 'Playbook created successfully' });
});

// Escalation Policies
app.get('/api/v1/operations/escalation-policies', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Critical Alarm Escalation', description: 'Escalation for critical alarms', levels: [{ order: 1, delay_minutes: 0, contacts: ['Operator On-Call'] }, { order: 2, delay_minutes: 15, contacts: ['Shift Supervisor'] }, { order: 3, delay_minutes: 30, contacts: ['Plant Manager'] }], active: true, created_at: new Date().toISOString() },
      { id: 2, name: 'High Priority Escalation', description: 'Escalation for high priority issues', levels: [{ order: 1, delay_minutes: 0, contacts: ['Operator On-Call'] }, { order: 2, delay_minutes: 30, contacts: ['Shift Supervisor'] }], active: true, created_at: new Date().toISOString() }
    ],
    meta: { total: 2, per_page: 50, current_page: 1 }
  });
});

app.post('/api/v1/operations/escalation-policies', (req, res) => {
  res.json({ data: { id: 3, ...req.body, created_at: new Date().toISOString() }, message: 'Policy created successfully' });
});

// Operations Events
app.get('/api/v1/operations/events', (req, res) => {
  res.json({
    data: [
      { id: '1', event_type: 'alarm', title: 'High Turbidity Alert', description: 'Turbidity exceeded threshold at Treatment Plant', severity: 'high', status: 'open', occurred_at: new Date(Date.now() - 3600000).toISOString(), facility: { id: 1, name: 'Elwak Treatment Plant' }, acknowledged: false },
      { id: '2', event_type: 'maintenance', title: 'Scheduled Pump Maintenance', description: 'Routine maintenance on Pump #2', severity: 'low', status: 'in_progress', occurred_at: new Date(Date.now() - 7200000).toISOString(), facility: { id: 2, name: 'Merti Pumping Station' }, acknowledged: true },
      { id: '3', event_type: 'incident', title: 'Minor Leak Detected', description: 'Small leak at junction valve', severity: 'medium', status: 'resolved', occurred_at: new Date(Date.now() - 86400000).toISOString(), facility: { id: 1, name: 'Elwak Distribution' }, acknowledged: true, resolved_at: new Date(Date.now() - 43200000).toISOString() }
    ],
    meta: { total: 3, per_page: 50, current_page: 1 }
  });
});

app.post('/api/v1/operations/events', (req, res) => {
  res.json({ data: { id: '4', ...req.body, created_at: new Date().toISOString() }, message: 'Event created successfully' });
});

app.post('/api/v1/operations/events/:id/acknowledge', (req, res) => {
  res.json({ data: { id: req.params.id, acknowledged: true, acknowledged_at: new Date().toISOString() }, message: 'Event acknowledged' });
});

app.post('/api/v1/operations/events/:id/resolve', (req, res) => {
  res.json({ data: { id: req.params.id, status: 'resolved', resolved_at: new Date().toISOString() }, message: 'Event resolved' });
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
      // Ensure Authorization header is forwarded
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        proxyReq.setHeader('Authorization', authHeader);
      }
      // Forward Accept and Content-Type headers
      proxyReq.setHeader('Accept', 'application/json');
      if (req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }
      
      // Re-stream body for POST/PUT/PATCH requests (express.json() consumes the body)
      if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
      
      log(`[Proxy] ${req.method} ${req.url} → Laravel (Auth: ${authHeader ? 'yes' : 'no'})`);
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

  // ALWAYS serve the app on port 5000 (or PORT env var for local dev)
  // this serves both the API and the client
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

// Register Phase 1-2 routes (core-registry must be after predictions but before proxy)
// This will be inserted during app startup
