# Integration & Platform Services Module - Gap Analysis
**Generated:** November 24, 2025  
**Status:** Comprehensive gap analysis with implementation roadmap

---

## Executive Summary

The Rural Water Supply MIS currently has **Settings & Configuration (50% complete)** but is **missing 14 critical integration & platform service components**. This analysis maps the required functionality against the current system and identifies implementation priorities.

**Total Gap Coverage:** 85% of platform services not yet implemented  
**Priority Modules:** API Gateway, MDM, EDRMS, Observability (Critical Path)  
**Estimated Implementation:** 3-4 weeks (modular approach)

---

## 1. Current State vs. Required State

### ✅ Already Implemented
| Component | Current Status | Module |
|-----------|----------------|--------|
| Role-Based Access Control | ✅ 90% Complete | Settings & Configuration |
| Module Enablement | ✅ Complete | Settings & Configuration |
| Workflows State Machine | ✅ 80% Complete | Workflows Engine (Module 18) |
| Drizzle ORM Schema | ✅ Complete | Shared Schema |
| Multi-Tenancy Isolation | ✅ Complete | All modules |

### ❌ Not Implemented
| Component | Gap | Priority | Tables Needed |
|-----------|-----|----------|----------------|
| **API Gateway** | 100% | CRITICAL | `api_keys`, `oauth_credentials`, `rate_limits`, `webhooks` |
| **Event Bus** | 100% | CRITICAL | `event_topics`, `subscriptions`, `event_log` |
| **Connectors** | 100% | HIGH | `connectors`, `connector_configs`, `sync_history` |
| **Data Warehouse** | 100% | HIGH | `dw_tables`, `dw_lineage`, `dw_retention_policy` |
| **Master Data Mgmt** | 100% | CRITICAL | `mdm_entities`, `mdm_matches`, `mdm_merge_history` |
| **SSO/SAML/OIDC** | 100% | CRITICAL | `sso_providers`, `sso_sessions`, `mfa_settings` |
| **EDRMS** | 100% | HIGH | `documents`, `document_versions`, `document_holds` |
| **Notifications** | 50% | HIGH | `notification_templates`, `notification_routes`, `comms_log` |
| **Form Builder** | 0% | MEDIUM | `forms`, `form_fields`, `form_responses` |
| **Device Registry** | 0% | MEDIUM | `edge_devices`, `sync_queues`, `device_heartbeat` |
| **Observability** | 0% | MEDIUM | `metrics`, `logs`, `traces`, `alerts` |
| **Backup/DR** | 0% | MEDIUM | `backup_plans`, `recovery_points`, `dr_drills` |
| **Secrets Vault** | 0% | MEDIUM | `secrets`, `secret_rotation`, `secret_audit` |
| **Comms/Templates** | 20% | MEDIUM | `message_templates`, `routing_rules`, `delivery_status` |

---

## 2. Critical Path Components (Implement First)

### Phase 1: Foundation (Weeks 1-1.5)
**Goal:** Enable external integrations and secure API access

```
┌─────────────────────────────┐
│ API Gateway & Auth          │ ← Start here
├─────────────────────────────┤
│ • API Keys & OAuth          │
│ • Rate Limiting             │
│ • Webhook Management        │
│ • HMAC Signing              │
└─────────────────────────────┘
         ↓
┌─────────────────────────────┐
│ Event Bus (Pub/Sub)         │
├─────────────────────────────┤
│ • Event Topics              │
│ • Subscriptions             │
│ • Event Streaming           │
│ • Dead-Letter Queues        │
└─────────────────────────────┘
```

### Phase 2: Data & Identity (Weeks 1.5-2.5)
```
┌──────────────────────────────────┐
│ Master Data Management (MDM)     │
├──────────────────────────────────┤
│ • Golden Records                 │
│ • Deduplication                  │
│ • Merge/Unmerge Workflows        │
│ • Survivorship Rules             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ SSO/Identity & Access            │
├──────────────────────────────────┤
│ • OIDC/SAML                      │
│ • MFA (TOTP/SMS)                 │
│ • ABAC Policies                  │
│ • Access Reviews                 │
└──────────────────────────────────┘
```

### Phase 3: Operations & Records (Weeks 2.5-4)
```
┌──────────────────────────────────┐
│ EDRMS (Document Management)      │
├──────────────────────────────────┤
│ • Document Library               │
│ • Versioning & Metadata          │
│ • Retention & Legal Hold         │
│ • Content Hashing                │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Observability & Operations       │
├──────────────────────────────────┤
│ • Metrics Collection             │
│ • Log Aggregation                │
│ • Trace Explorer                 │
│ • Anomaly Detection              │
└──────────────────────────────────┘
```

---

## 3. Detailed Gap Analysis by Component

### 3.1 API Gateway (CRITICAL - 0% Complete)

**Required Functionality:**
- REST & GraphQL endpoint management
- API key generation & rotation
- OAuth 2.0 client credentials flow
- HMAC webhook signing
- Per-route rate limits & quotas
- Request/response logging
- API documentation (OpenAPI/Swagger)

**Required Tables:**
```sql
api_endpoints (id, tenant_id, path, method, description, rate_limit, auth_type)
api_keys (id, tenant_id, key, secret, app_name, last_used, revoked_at)
oauth_clients (id, tenant_id, client_id, client_secret, redirect_uris, scopes)
webhooks (id, tenant_id, endpoint_url, secret, events, retry_policy, active)
api_audit_log (id, endpoint, user_id, status_code, latency_ms, timestamp)
```

**UI Pages Needed:**
- API Catalog (table: endpoint, version, auth type, owner, status, actions)
- API Key Management (generate, rotate, revoke)
- Webhook Manager (create, test, delivery logs, retry policy)
- Rate Limit Configuration

**Status:** 🔴 NOT STARTED

---

### 3.2 Event Bus & Connectors (CRITICAL - 0% Complete)

**Required Functionality:**
- Pub/Sub message bus (Kafka/NATS/SNS)
- Topic subscriptions
- Dead-letter queue handling
- Connector adapters: SCADA (OPC-UA/MQTT), AMI (DLMS/CSV/S3), ERP, WARIS, NDMA
- Scheduled ETL jobs

**Required Tables:**
```sql
event_topics (id, tenant_id, topic_name, description, retention_days, schema)
event_subscriptions (id, tenant_id, topic_id, consumer, retry_policy)
event_log (id, tenant_id, topic_id, payload, status, timestamp)
connectors (id, tenant_id, type, name, status, last_sync)
connector_configs (id, connector_id, credentials, polling_interval, mode)
sync_history (id, connector_id, records_imported, status, duration_seconds)
```

**UI Pages Needed:**
- Connector Gallery (SCADA, AMI, ERP, WARIS, NDMA cards)
- Connector Setup Wizard
- Event Monitor (real-time event stream)
- Sync Status Dashboard

**Status:** 🔴 NOT STARTED

---

### 3.3 Master Data Management (CRITICAL - 0% Complete)

**Required Functionality:**
- Golden record management (customers, assets, locations, vendors)
- Automated deduplication (phonetic + fuzzy matching)
- Merge/unmerge with audit trail
- Survivorship rules (priority, most-recent, longest)
- Source system trust scoring
- Data stewardship workflows

**Required Tables:**
```sql
mdm_entities (id, tenant_id, entity_type, source_system, source_id, trust_score, status)
mdm_matches (id, entity_a_id, entity_b_id, similarity_score, match_type, auto_approved)
mdm_merges (id, winning_entity_id, losing_entity_id, approved_by, approved_at, reversible)
mdm_merge_history (id, merge_id, field, old_value, new_value, source_system)
mdm_rules (id, tenant_id, entity_type, survivorship_rule, match_threshold, blocking_keys)
mdm_conflicts (id, field, entity_a_value, entity_b_value, resolver_choice, resolved_at)
```

**UI Pages Needed:**
- Entity Hubs (Customers, Assets, Locations, Vendors)
- Match & Merge Workbench
- Conflict Resolver (side-by-side comparison)
- MDM Rules Configuration
- Merge History & Rollback

**Status:** 🔴 NOT STARTED

---

### 3.4 SSO / Identity & Access (CRITICAL - 30% Complete)

**Current:** Basic RBAC via role_module_access table  
**Missing:** SSO, MFA, ABAC, device trust, session management

**Required Functionality:**
- OIDC/SAML provider integration
- MFA enforcement (TOTP, SMS)
- Attribute-Based Access Control (ABAC)
- Device trust policies
- Session management & login audit
- Access reviews & attestation
- Approval workflows for elevated access

**Required Tables:**
```sql
sso_providers (id, tenant_id, provider_type, issuer, client_id, client_secret, certificate)
mfa_settings (id, tenant_id, enforcement_policy, allowed_methods, grace_period_days)
sso_sessions (id, user_id, session_token, created_at, expires_at, ip_address, device_id)
abac_policies (id, tenant_id, name, condition_json, effect, priority)
abac_attributes (id, policy_id, attribute_name, operator, value)
access_reviews (id, tenant_id, campaign_id, user_id, reviewer_id, decision, decision_date)
device_trust (id, user_id, device_id, device_name, last_seen, trust_score)
login_audit (id, user_id, status, ip_address, timestamp, mfa_used)
```

**UI Pages Needed:**
- SSO Configuration (IdP setup, certificate upload)
- MFA Settings & Enrollment
- ABAC Policy Builder
- Access Reviews Dashboard
- Login Audit Log

**Status:** 🟡 30% COMPLETE (RBAC done, SSO/MFA/ABAC missing)

---

### 3.5 Data Warehouse & Lakehouse (HIGH - 0% Complete)

**Required Functionality:**
- Raw/refined/curated zones (immutable raw layer)
- Time-partitioned fact tables
- Data marts (operations, finance, quality, customer, projects)
- Row/column security & PII masking
- Data catalog with lineage tracking
- Retention policies (hot/warm/cold tiers)

**Required Tables:**
```sql
dw_tables (id, tenant_id, schema_zone, table_name, record_count, last_refreshed, retention_policy)
dw_lineage (id, source_table_id, target_table_id, transformation_logic, dependency_chain)
dw_retention_policy (id, table_id, hot_days, warm_days, cold_days, archive_destination)
dw_access_policy (id, table_id, column_name, row_filter_sql, masked_format)
dw_catalog_metadata (id, table_id, column_name, data_type, description, pii_level, tags)
```

**UI Pages Needed:**
- Data Catalog (search, lineage graph, freshness)
- Mart Explorer (predefined queries, export CSV/Parquet)
- Retention Manager (policy viewer, archive actions)
- Lineage Visualizer

**Status:** 🔴 NOT STARTED

---

### 3.6 EDRMS - Document & Records Management (HIGH - 0% Complete)

**Required Functionality:**
- Document library with versioning
- Metadata schemas (per document type)
- Check-in/check-out workflows
- Legal hold & retention policies
- Content hashing & virus scan hooks
- Access control per document

**Required Tables:**
```sql
documents (id, tenant_id, document_type, filename, file_path, file_hash, file_size, owner_id)
document_versions (id, document_id, version_number, uploaded_by, uploaded_at, file_path, change_log)
document_metadata (id, document_id, metadata_key, metadata_value, required)
document_holds (id, document_id, reason, placed_by, placed_date, hold_reason_code)
document_retention (id, document_type, retention_years, disposal_method, archival_location)
document_checkout (id, document_id, checked_out_by, checked_out_date, due_date, purpose)
```

**UI Pages Needed:**
- Document Library (faceted search, preview, upload)
- Metadata Editor (schema per type)
- Version Timeline
- Retention & Holds Manager
- Document Checkout Log

**Status:** 🔴 NOT STARTED

---

### 3.7 Notifications & Communications (MEDIUM - 20% Complete)

**Current:** Basic in-app notifications  
**Missing:** Templates, multi-channel routing, escalation chains

**Required Functionality:**
- SMS/USSD/Email/WhatsApp templates
- i18n placeholders & localization
- Routing rules (IF event THEN provider)
- Escalation chains & quiet hours
- A/B testing
- Delivery receipts & retry logic
- Outbound/inbound connectors

**Required Tables:**
```sql
notification_templates (id, tenant_id, type, channel, name, subject, body, variables, i18n_locale)
notification_routes (id, tenant_id, condition_json, priority, provider, template_id, escalation_chain)
notification_queue (id, template_id, recipient, variables, status, attempts, next_retry)
notification_delivery (id, queue_id, status, provider_message_id, error_message, delivered_at)
notification_receipts (id, delivery_id, status, timestamp, provider_metadata)
notification_opt_out (id, recipient, channel, reason, opt_out_date)
```

**UI Pages Needed:**
- Template Designer (drag-drop, variables, preview)
- Routing Rules Builder
- Comms Console (live feed, filters, resend)
- Opt-Out Management
- Delivery Analytics

**Status:** 🟡 20% COMPLETE (UI alerts exist, templates/routing missing)

---

### 3.8 Configuration & Theming (MEDIUM - 10% Complete)

**Current:** Module settings & role access  
**Missing:** Tariffs, KPIs, feature flags, branding, localization

**Required Functionality:**
- Global tariff management (with tenant overrides)
- KPI targets & thresholds
- Feature flags & A/B testing
- Branding (logo, colors, fonts)
- Localization (i18n, locale strings)
- Units & formats (metric/imperial, date formats)
- Theme customization (dark mode, accessibility)

**Required Tables:**
```sql
tariff_configurations (id, tenant_id, tariff_type, volumetric_charges, fixed_charges, effective_date, override_county)
kpi_targets (id, tenant_id, kpi_key, target_value, current_value, tracking_interval)
feature_flags (id, tenant_id, flag_key, is_enabled, rollout_percentage, rollout_rules)
branding_config (id, tenant_id, logo_url, primary_color, secondary_color, font_family)
locale_settings (id, tenant_id, language_code, strings_json, date_format, currency)
unit_formats (id, tenant_id, volume_unit, pressure_unit, temperature_unit, flow_unit)
theme_settings (id, tenant_id, dark_mode_enabled, contrast_level, font_size_adjustment)
```

**UI Pages Needed:**
- Settings Hub (Branding, Localization, Tariffs, KPIs, Feature Flags)
- Theme Preview with contrast checker
- Tariff Manager with override rules
- KPI Dashboard

**Status:** 🟡 10% COMPLETE (Module settings done, config/theming missing)

---

### 3.9 Low-Code Forms & Workflows (MEDIUM - 40% Complete)

**Current:** Workflows Engine exists for approval workflows  
**Missing:** Visual form builder, form responses, conditional logic

**Required Functionality:**
- Visual form builder (drag-drop fields)
- Field types: textbox, number, dropdown, multiselect, date, photo, signature, GPS, section, note
- Conditional logic & validation rules
- Form versioning & rollback
- Mobile & portal rendering
- Response storage & search
- Workflow integration

**Required Tables:**
```sql
forms (id, tenant_id, name, description, version, is_published, created_by)
form_fields (id, form_id, field_type, label, required, validation_rules, conditional_logic, order)
form_responses (id, form_id, respondent_id, response_data, submitted_at, status)
form_field_choices (id, field_id, choice_label, choice_value, order)
workflow_forms (id, workflow_definition_id, form_id, required_for_state, auto_populate_data)
```

**UI Pages Needed:**
- Form Builder (palette, canvas, properties, preview)
- Form Response Viewer (gallery, detail, export)
- Workflow Form Integration

**Status:** 🟡 40% COMPLETE (Workflows done, form builder missing)

---

### 3.10 Device Registry & Offline Sync (MEDIUM - 5% Complete)

**Current:** Minimal device tracking in connections  
**Missing:** Device registry, sync queues, offline conflict resolution

**Required Functionality:**
- Device registration (edge devices, kiosks, mobile)
- Sync queue management with sequencing
- Conflict resolution (last-write-wins, merge strategy)
- Bandwidth-aware sync windows
- Health heartbeat & status monitoring
- Key rotation & device wiping

**Required Tables:**
```sql
edge_devices (id, tenant_id, device_id, device_name, site_id, device_role, last_seen, status)
device_credentials (id, device_id, api_key, secret, rotation_interval, last_rotated)
sync_queue (id, device_id, entity_type, entity_id, operation, payload, status, attempts)
sync_history (id, device_id, batch_id, records_synced, conflicts_resolved, duration_seconds, timestamp)
device_heartbeat (id, device_id, cpu_usage, memory_usage, queue_depth, last_ping, status)
sync_conflicts (id, queue_id, conflict_type, device_value, server_value, resolution_strategy)
```

**UI Pages Needed:**
- Device Registry (list, details, rotate keys, wipe, pause sync)
- Sync Monitor (charts: ops/sec, backlog, success/fail, lag per entity)
- Conflict Log & Diff Viewer
- Health Dashboard (per-device metrics)

**Status:** 🔴 5% COMPLETE (basic device tracking, registry/sync missing)

---

### 3.11 Observability & Operations (MEDIUM - 0% Complete)

**Required Functionality:**
- Metrics collection (OpenTelemetry)
- Log aggregation & search
- Distributed trace visualization
- SLO/SLA dashboards
- Anomaly detection & alerts
- Runbooks with safe automation
- Self-healing actions

**Required Tables:**
```sql
metrics (id, tenant_id, service_name, metric_name, metric_value, tags_json, timestamp)
logs (id, tenant_id, service_name, log_level, message, context_json, timestamp)
traces (id, tenant_id, trace_id, span_id, service_name, operation, duration_ms, status)
alerts (id, tenant_id, condition, threshold, state, fired_at, acknowledged_by)
alert_rules (id, tenant_id, name, metric_condition, threshold, severity, notification_route)
runbooks (id, tenant_id, name, description, steps_markdown, automated_script, safe_guards)
slo_definitions (id, tenant_id, service, objective_percent, warning_threshold, critical_threshold)
anomalies (id, tenant_id, metric_name, detected_value, baseline_value, severity, timestamp)
```

**UI Pages Needed:**
- Ops Dashboard (service health, p95 latency, error rate, queue depth, alerts)
- Metrics Explorer (query builder, visualization)
- Trace Explorer (flame graph, error aggregation)
- Runbooks & Execution Log
- SLO Dashboard
- Anomaly Alert Log

**Status:** 🔴 NOT STARTED

---

### 3.12 Backup, DR & Archival (MEDIUM - 0% Complete)

**Required Functionality:**
- Policy-based backups (full/incremental)
- Cross-region replication
- RPO/RTO tracking
- WORM (Write-Once-Read-Many) backups
- DR drills with pass/fail metrics
- Restore workflows with approvals
- Immutable backup vault

**Required Tables:**
```sql
backup_plans (id, tenant_id, name, frequency, retention_days, backup_type, destination)
backup_snapshots (id, backup_plan_id, snapshot_timestamp, size_gb, status, encryption_key_id)
backup_retention_policy (id, plan_id, hot_days, warm_days, cold_days, vault_id)
dr_drills (id, backup_plan_id, drill_date, recovery_point_used, duration_seconds, status, issues)
recovery_points (id, backup_plan_id, recovery_time, data_completeness_percent, approvals_required)
vault_credentials (id, backup_plan_id, vault_type, access_key, secret, encryption_key)
restore_request (id, recovery_point_id, requested_by, approval_status, target_environment, timestamp)
```

**UI Pages Needed:**
- Backup Planner (schedules, retention, last success)
- Recovery Point Catalog (RTO/RPO, restore actions)
- DR Drill Console (run test, capture metrics, report)
- Restore Workflow (approvals, monitoring)
- Vault Management

**Status:** 🔴 NOT STARTED

---

### 3.13 Security Operations (MEDIUM - 5% Complete)

**Current:** Minimal password hashing  
**Missing:** Secrets vault, key rotation, dependency scanning, SIEM integration

**Required Functionality:**
- Secrets management (KMS/HSM)
- Key rotation policies & automation
- Dependency vulnerability scanning
- SIEM integration & log shipping
- User behavior analytics
- Threat detection

**Required Tables:**
```sql
secrets (id, tenant_id, secret_name, secret_value_encrypted, scope, rotation_interval, last_rotated)
secret_audit (id, secret_id, action, accessed_by, accessed_at, ip_address)
secret_rotation_history (id, secret_id, old_value_hash, new_value_hash, rotated_at, rotated_by)
vulnerability_findings (id, tenant_id, component_name, vuln_id, severity, found_date, remediation_sla)
vulnerability_evidence (id, finding_id, evidence_type, evidence_value, link)
siem_events (id, tenant_id, rule_id, event_type, severity, source, detail_json, ingested_at)
threat_detections (id, tenant_id, detection_type, confidence_score, indicator, context_json, timestamp)
```

**UI Pages Needed:**
- Secrets Vault (list, rotate, revoke, access logs)
- Vulnerability Board (by severity, age, remediation SLA)
- SIEM Feed (filters, correlation graphs, incident export)
- Threat Detection Dashboard
- Key Rotation Schedule

**Status:** 🔴 5% COMPLETE (basic secret storage, vault/rotation/SIEM missing)

---

## 4. Implementation Roadmap

### Week 1: Critical Path - Foundation
**Effort: 40 hours**

1. **API Gateway & Auth** (12 hours)
   - Add tables: api_endpoints, api_keys, oauth_clients, webhooks
   - Create API key management UI
   - Implement middleware for rate limiting

2. **Event Bus Setup** (10 hours)
   - Add tables: event_topics, subscriptions, event_log
   - Create connector config schema
   - Build basic pub/sub (use existing database)

3. **Master Data Management** (12 hours)
   - Add MDM tables (entities, matches, merges)
   - Build entity hub UI
   - Implement dedup/merge logic

4. **SSO/MFA** (6 hours)
   - Add SSO provider tables
   - Create IdP configuration UI
   - Implement OIDC integration

### Week 2: Data & Operations
**Effort: 40 hours**

5. **EDRMS** (15 hours)
   - Document library tables & versioning
   - File upload & preview
   - Retention policies UI

6. **Data Warehouse** (12 hours)
   - Create DW zone tables (raw/refined/curated)
   - Build data catalog UI
   - Implement lineage tracking

7. **Notifications** (8 hours)
   - Template designer
   - Routing rules builder
   - Multi-channel sender

8. **Observability** (5 hours)
   - Metrics collection setup
   - Basic ops dashboard

### Week 3-4: Operations & Security
**Effort: 40 hours**

9. **Device Registry & Offline Sync** (12 hours)
10. **Backup/DR Management** (10 hours)
11. **Secrets Vault & SIEM** (10 hours)
12. **Low-Code Form Builder** (8 hours)

---

## 5. Success Criteria & Acceptance

### All External Integrations
- [ ] 100% of API calls via gateway with auth
- [ ] Rate limits enforced per route
- [ ] Webhooks use HMAC signing
- [ ] Dead-letter queues for failed events

### Master Data Management
- [ ] Merges are reversible with audit trail
- [ ] Lineage intact after merges
- [ ] Data stewardship approvals logged
- [ ] Dedup accuracy >95%

### Security & Access
- [ ] Access reviews complete with evidence
- [ ] MFA enforced per policy
- [ ] SSO operational with audit
- [ ] Secrets rotated on schedule

### Operations
- [ ] ETL pipelines versioned
- [ ] Failures alert Ops team
- [ ] RPO/RTO achieved in drills
- [ ] Observability >90% coverage

---

## 6. Quick-Start Implementation (This Sprint)

### Minimum Viable Product (MVP)
Focus on these 3 components first:

```
1. API Gateway (CRITICAL)
   └─ Tables: api_keys, oauth_clients, webhooks
   └─ UI: API Catalog, Key Management
   └─ Time: 12 hours
   
2. Master Data Management (CRITICAL)
   └─ Tables: mdm_entities, mdm_matches, mdm_merges
   └─ UI: Entity Hubs, Match Workbench
   └─ Time: 12 hours
   
3. SSO/Identity (CRITICAL)
   └─ Tables: sso_providers, mfa_settings, abac_policies
   └─ UI: SSO Config, MFA Settings, ABAC Builder
   └─ Time: 8 hours
```

**Total MVP Time: 32 hours (4 development days)**

---

## 7. Next Steps

1. **Approve MVP scope** (API Gateway + MDM + SSO)
2. **Create database schema** for Phase 1 tables
3. **Build UI components** for 3 critical modules
4. **Add mock connectors** (SCADA, AMI, WARIS)
5. **Set up event bus** using existing Drizzle ORM

---

**Document Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Ready for Implementation  
**Approval:** Awaiting stakeholder confirmation
