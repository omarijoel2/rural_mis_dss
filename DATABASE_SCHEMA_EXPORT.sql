-- ============================================================================
-- RURAL WATER SUPPLY MIS - DATABASE SCHEMA EXPORT
-- Generated: November 24, 2025
-- Purpose: Complete schema dump for all modules including Settings & Configuration
-- ============================================================================

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- ============================================================================
-- WORKFLOWS ENGINE (Module 18)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wf_definitions (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    spec JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT false,
    created_by_id VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_wf_def_tenant_key UNIQUE (tenant_id, key)
);

CREATE TABLE IF NOT EXISTS wf_instances (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    def_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id VARCHAR NOT NULL,
    state TEXT NOT NULL,
    context JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wf_transitions (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL,
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,
    trigger TEXT NOT NULL,
    actor_id VARCHAR,
    payload JSONB,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wf_tasks (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL,
    state TEXT NOT NULL,
    assignee_id VARCHAR,
    role TEXT,
    due_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'open',
    claimed_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wf_slas (
    id SERIAL PRIMARY KEY,
    def_id INTEGER NOT NULL,
    state TEXT NOT NULL,
    threshold_seconds INTEGER NOT NULL,
    policy JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wf_escalations (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL,
    state TEXT NOT NULL,
    level INTEGER NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target TEXT NOT NULL,
    channel TEXT NOT NULL,
    meta JSONB
);

CREATE TABLE IF NOT EXISTS wf_webhooks (
    id SERIAL PRIMARY KEY,
    def_id INTEGER NOT NULL,
    event TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wf_signals (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL,
    signal TEXT NOT NULL,
    payload JSONB,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GROUNDWATER & AQUIFER MANAGEMENT (GW4R Phase 1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aquifers (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    county TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    yield_m3_day INTEGER,
    recharge_mm_year INTEGER,
    depth_m INTEGER,
    geology TEXT,
    risk_level TEXT,
    water_quality JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groundwater_monitoring (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    aquifer_id INTEGER NOT NULL,
    water_level_m DECIMAL(10, 2),
    abstraction_m3_day INTEGER,
    yield_m3_day INTEGER,
    chloride_mg_l DECIMAL(10, 2),
    fluoride_mg_l DECIMAL(10, 2),
    nitrate_mg_l DECIMAL(10, 2),
    measurement_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drought_events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    severity TEXT,
    declaration_date TIMESTAMP,
    affected_population INTEGER,
    active_boreholes INTEGER,
    status TEXT DEFAULT 'declared',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gender_equity_tracking (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    scheme_id VARCHAR,
    gender TEXT,
    age_group TEXT,
    vulnerability_status TEXT,
    water_access_hours_day DECIMAL(5, 2),
    collection_burden_hours_day DECIMAL(5, 2),
    satisfaction_score INTEGER,
    collection_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competency_assessments (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    operator_id VARCHAR NOT NULL,
    topic TEXT NOT NULL,
    score INTEGER,
    certification_status TEXT,
    validity_start TIMESTAMP,
    validity_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vulnerable_groups (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    scheme_id VARCHAR,
    group_name TEXT NOT NULL,
    population_count INTEGER,
    access_challenge TEXT,
    support_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PREDICTIVE ANALYTICS & MACHINE LEARNING (Phase 3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    prediction_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id VARCHAR,
    prediction_value DECIMAL(10, 2),
    confidence DECIMAL(5, 4),
    prediction_date TIMESTAMP,
    actual_value DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS anomaly_events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    dma_id VARCHAR NOT NULL,
    anomaly_type TEXT NOT NULL,
    severity TEXT,
    nrw_impact_percent DECIMAL(5, 2),
    cost_impact_kes INTEGER,
    detection_date TIMESTAMP,
    resolution_date TIMESTAMP,
    status TEXT DEFAULT 'detected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forecast_data (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    scheme_id VARCHAR,
    forecast_date DATE,
    consumption_m3 INTEGER,
    confidence_level DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nrw_snapshots (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    dma_id VARCHAR NOT NULL,
    nrw_percent DECIMAL(5, 2),
    physical_loss_percent DECIMAL(5, 2),
    commercial_loss_percent DECIMAL(5, 2),
    cost_of_water DECIMAL(10, 2),
    annual_cost_impact_kes INTEGER,
    snapshot_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interventions (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    dma_id VARCHAR NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    estimated_cost INTEGER,
    actual_cost INTEGER,
    impact_nrw_reduction INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SETTINGS & CONFIGURATION (NEW - Nov 24 2025)
-- ============================================================================

CREATE TABLE IF NOT EXISTS module_settings (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    module_key TEXT NOT NULL,
    module_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    icon TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_module_settings_tenant_key UNIQUE (tenant_id, module_key)
);

CREATE TABLE IF NOT EXISTS role_module_access (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    role_id VARCHAR NOT NULL,
    module_key TEXT NOT NULL,
    has_access BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_role_module_access_tenant_role_module UNIQUE (tenant_id, role_id, module_key)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_wf_def_active ON wf_definitions(active);
CREATE INDEX idx_wf_inst_tenant ON wf_instances(tenant_id);
CREATE INDEX idx_wf_inst_entity ON wf_instances(entity_type, entity_id);
CREATE INDEX idx_wf_task_assignee ON wf_tasks(assignee_id);
CREATE INDEX idx_wf_task_status ON wf_tasks(status);

CREATE INDEX idx_aquifer_tenant ON aquifers(tenant_id);
CREATE INDEX idx_aquifer_county ON aquifers(county);
CREATE INDEX idx_groundwater_monitoring_aquifer ON groundwater_monitoring(aquifer_id);
CREATE INDEX idx_groundwater_monitoring_date ON groundwater_monitoring(measurement_date);
CREATE INDEX idx_drought_events_tenant ON drought_events(tenant_id);
CREATE INDEX idx_drought_events_status ON drought_events(status);
CREATE INDEX idx_gender_equity_tenant ON gender_equity_tracking(tenant_id);
CREATE INDEX idx_gender_equity_gender ON gender_equity_tracking(gender);
CREATE INDEX idx_competency_assessments_operator ON competency_assessments(operator_id);
CREATE INDEX idx_vulnerable_groups_tenant ON vulnerable_groups(tenant_id);

CREATE INDEX idx_predictions_tenant ON predictions(tenant_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_anomaly_events_dma ON anomaly_events(dma_id);
CREATE INDEX idx_anomaly_events_date ON anomaly_events(detection_date);
CREATE INDEX idx_nrw_snapshots_dma ON nrw_snapshots(dma_id);
CREATE INDEX idx_nrw_snapshots_date ON nrw_snapshots(snapshot_date);
CREATE INDEX idx_interventions_dma ON interventions(dma_id);
CREATE INDEX idx_interventions_status ON interventions(status);

CREATE INDEX idx_module_settings_enabled ON module_settings(is_enabled);
CREATE INDEX idx_role_module_access_role ON role_module_access(role_id);
CREATE INDEX idx_role_module_access_module ON role_module_access(module_key);

-- ============================================================================
-- END OF SCHEMA EXPORT
-- ============================================================================
