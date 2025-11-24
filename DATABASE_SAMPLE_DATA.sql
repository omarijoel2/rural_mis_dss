-- ============================================================================
-- RURAL WATER SUPPLY MIS - SAMPLE DATA
-- Generated: November 24, 2025
-- For: Testing & Development
-- ============================================================================

-- Sample Module Settings (14 modules)
INSERT INTO module_settings (tenant_id, module_key, module_name, is_enabled, description, icon, "order") VALUES
('tenant-001', 'core-registry', 'Core Registry', true, 'Schemes, assets, facilities management', 'Database', 1),
('tenant-001', 'core-ops', 'Core Operations', true, 'Telemetry, outages, SCADA control', 'Activity', 2),
('tenant-001', 'crm', 'CRM', true, 'Customer relationship management', 'Users', 3),
('tenant-001', 'cmms', 'CMMS', true, 'Asset maintenance and work orders', 'Wrench', 4),
('tenant-001', 'water-quality', 'Water Quality', true, 'WQ parameters, sampling, compliance', 'Droplet', 5),
('tenant-001', 'hydromet', 'Hydromet', true, 'Hydro-meteorological data', 'Cloud', 6),
('tenant-001', 'costing', 'Costing & Finance', true, 'Budgets, allocations, cost-to-serve', 'DollarSign', 7),
('tenant-001', 'procurement', 'Procurement', true, 'RFQs, LPOs, vendor management', 'ShoppingCart', 8),
('tenant-001', 'projects', 'Projects', true, 'Project planning and tracking', 'Briefcase', 9),
('tenant-001', 'community', 'Community & Stakeholder', true, 'Committees, grievances, vendors', 'Users', 10),
('tenant-001', 'risk-compliance', 'Risk, Compliance & Governance', true, 'Risk register, incidents, audit', 'Shield', 11),
('tenant-001', 'dsa', 'Decision Support & Analytics', true, 'Forecasts, scenarios, optimization', 'BarChart3', 12),
('tenant-001', 'training', 'Training & Knowledge', true, 'Learning management, certifications', 'BookOpen', 13),
('tenant-001', 'me', 'M&E', true, 'Monitoring & evaluation, KPIs', 'PieChart', 14);

-- Sample Role-Module Access Matrix
-- Admin: All modules
INSERT INTO role_module_access (tenant_id, role_id, module_key, has_access) VALUES
('tenant-001', 'admin', 'core-registry', true),
('tenant-001', 'admin', 'core-ops', true),
('tenant-001', 'admin', 'crm', true),
('tenant-001', 'admin', 'cmms', true),
('tenant-001', 'admin', 'water-quality', true),
('tenant-001', 'admin', 'hydromet', true),
('tenant-001', 'admin', 'costing', true),
('tenant-001', 'admin', 'procurement', true),
('tenant-001', 'admin', 'projects', true),
('tenant-001', 'admin', 'community', true),
('tenant-001', 'admin', 'risk-compliance', true),
('tenant-001', 'admin', 'dsa', true),
('tenant-001', 'admin', 'training', true),
('tenant-001', 'admin', 'me', true);

-- Manager: Core modules
INSERT INTO role_module_access (tenant_id, role_id, module_key, has_access) VALUES
('tenant-001', 'manager', 'core-registry', true),
('tenant-001', 'manager', 'core-ops', true),
('tenant-001', 'manager', 'crm', true),
('tenant-001', 'manager', 'cmms', true),
('tenant-001', 'manager', 'water-quality', true),
('tenant-001', 'manager', 'projects', true),
('tenant-001', 'manager', 'costing', true),
('tenant-001', 'manager', 'hydromet', false),
('tenant-001', 'manager', 'procurement', false),
('tenant-001', 'manager', 'community', false),
('tenant-001', 'manager', 'risk-compliance', false),
('tenant-001', 'manager', 'dsa', false),
('tenant-001', 'manager', 'training', false),
('tenant-001', 'manager', 'me', false);

-- Operator: Operational modules
INSERT INTO role_module_access (tenant_id, role_id, module_key, has_access) VALUES
('tenant-001', 'operator', 'core-ops', true),
('tenant-001', 'operator', 'cmms', true),
('tenant-001', 'operator', 'water-quality', true),
('tenant-001', 'operator', 'core-registry', false),
('tenant-001', 'operator', 'crm', false),
('tenant-001', 'operator', 'hydromet', false),
('tenant-001', 'operator', 'costing', false),
('tenant-001', 'operator', 'procurement', false),
('tenant-001', 'operator', 'projects', false),
('tenant-001', 'operator', 'community', false),
('tenant-001', 'operator', 'risk-compliance', false),
('tenant-001', 'operator', 'dsa', false),
('tenant-001', 'operator', 'training', false),
('tenant-001', 'operator', 'me', false);

-- Analyst: Analytics modules
INSERT INTO role_module_access (tenant_id, role_id, module_key, has_access) VALUES
('tenant-001', 'analyst', 'dsa', true),
('tenant-001', 'analyst', 'me', true),
('tenant-001', 'analyst', 'costing', true),
('tenant-001', 'analyst', 'core-registry', true),
('tenant-001', 'analyst', 'core-ops', false),
('tenant-001', 'analyst', 'crm', false),
('tenant-001', 'analyst', 'cmms', false),
('tenant-001', 'analyst', 'water-quality', false),
('tenant-001', 'analyst', 'hydromet', false),
('tenant-001', 'analyst', 'procurement', false),
('tenant-001', 'analyst', 'projects', false),
('tenant-001', 'analyst', 'community', false),
('tenant-001', 'analyst', 'risk-compliance', false),
('tenant-001', 'analyst', 'training', false);

-- Viewer: Read-only modules
INSERT INTO role_module_access (tenant_id, role_id, module_key, has_access) VALUES
('tenant-001', 'viewer', 'core-registry', true),
('tenant-001', 'viewer', 'me', true),
('tenant-001', 'viewer', 'dsa', true),
('tenant-001', 'viewer', 'core-ops', false),
('tenant-001', 'viewer', 'crm', false),
('tenant-001', 'viewer', 'cmms', false),
('tenant-001', 'viewer', 'water-quality', false),
('tenant-001', 'viewer', 'hydromet', false),
('tenant-001', 'viewer', 'costing', false),
('tenant-001', 'viewer', 'procurement', false),
('tenant-001', 'viewer', 'projects', false),
('tenant-001', 'viewer', 'community', false),
('tenant-001', 'viewer', 'risk-compliance', false),
('tenant-001', 'viewer', 'training', false);

-- Sample Aquifers (ASAL Counties)
INSERT INTO aquifers (tenant_id, key, name, county, latitude, longitude, yield_m3_day, recharge_mm_year, depth_m, geology, risk_level, water_quality) VALUES
('tenant-001', 'aquifer-turkana-01', 'Turkana Basin South', 'Turkana', -0.5, 35.2, 800, 45, 350, 'Fractured sandstone', 'medium', '{"salinity": 2100, "fluoride": 4.2}'),
('tenant-001', 'aquifer-turkana-02', 'Turkana Basin North', 'Turkana', 2.1, 35.8, 600, 35, 280, 'Fractured limestone', 'medium', '{"salinity": 1800, "fluoride": 3.8}'),
('tenant-001', 'aquifer-marsabit-01', 'Marsabit Volcanic', 'Marsabit', 2.7, 37.6, 450, 40, 240, 'Volcanic basalt', 'high', '{"salinity": 2400, "fluoride": 5.1}'),
('tenant-001', 'aquifer-wajir-01', 'Wajir Alluvial', 'Wajir', 1.5, 40.2, 350, 30, 150, 'Alluvial deposits', 'high', '{"salinity": 3100, "fluoride": 6.2}'),
('tenant-001', 'aquifer-garissa-01', 'Garissa Sandstone', 'Garissa', -0.4, 39.6, 550, 38, 320, 'Tertiary sandstone', 'medium', '{"salinity": 2000, "fluoride": 4.5}'),
('tenant-001', 'aquifer-mandera-01', 'Mandera Basin', 'Mandera', 3.9, 41.5, 400, 32, 200, 'Fractured dolomite', 'high', '{"salinity": 2800, "fluoride": 5.8}');

-- Sample Groundwater Monitoring Data
INSERT INTO groundwater_monitoring (tenant_id, aquifer_id, water_level_m, abstraction_m3_day, yield_m3_day, chloride_mg_l, fluoride_mg_l, nitrate_mg_l, measurement_date) VALUES
(1, 1, 45.2, 600, 800, 2150, 4.3, 15.2, '2025-11-24'),
(1, 1, 45.5, 580, 820, 2100, 4.1, 14.8, '2025-11-23'),
(1, 2, 38.1, 400, 600, 1850, 3.9, 12.5, '2025-11-24'),
(1, 3, 32.4, 300, 450, 2450, 5.2, 18.3, '2025-11-24'),
(1, 4, 28.7, 250, 350, 3150, 6.3, 22.1, '2025-11-24');

-- Sample Gender & Equity Data
INSERT INTO gender_equity_tracking (tenant_id, scheme_id, gender, age_group, vulnerability_status, water_access_hours_day, collection_burden_hours_day, satisfaction_score, collection_date) VALUES
('tenant-001', 'scheme-turkana-01', 'Female', '20-35', 'Vulnerable', 2.5, 4.2, 6, '2025-11-24'),
('tenant-001', 'scheme-turkana-01', 'Female', '36-50', 'Vulnerable', 2.3, 4.5, 5, '2025-11-24'),
('tenant-001', 'scheme-turkana-01', 'Male', '20-35', 'Non-vulnerable', 2.8, 1.2, 7, '2025-11-24'),
('tenant-001', 'scheme-turkana-01', 'Male', '36-50', 'Non-vulnerable', 2.9, 1.0, 8, '2025-11-24');

-- Sample Drought Events
INSERT INTO drought_events (tenant_id, name, severity, declaration_date, affected_population, active_boreholes, status) VALUES
('tenant-001', 'Turkana Drought 2025', 'severe', '2025-01-15', 250000, 15, 'declared'),
('tenant-001', 'Marsabit Drought 2025', 'critical', '2025-02-20', 180000, 12, 'ongoing'),
('tenant-001', 'Wajir Drought 2025', 'severe', '2025-03-10', 220000, 18, 'declared');

-- ============================================================================
-- END OF SAMPLE DATA
-- ============================================================================
