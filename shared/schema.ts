import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { varchar, jsonb, timestamp, index, uniqueIndex, pgTable as table } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============ WORKFLOWS ENGINE ============

export const wfDefinitions = table('wf_definitions', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  version: integer('version').notNull().default(1),
  spec: jsonb('spec').notNull(),
  active: boolean('active').notNull().default(false),
  createdById: varchar('created_by_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  uniqueIndex('idx_wf_def_tenant_key').on(t.tenantId, t.key),
  index('idx_wf_def_active').on(t.active),
]);

export const wfInstances = table('wf_instances', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  defId: integer('def_id').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: varchar('entity_id').notNull(),
  state: text('state').notNull(),
  context: jsonb('context'),
  startedAt: timestamp('started_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  closedAt: timestamp('closed_at'),
}, (t) => [
  index('idx_wf_inst_tenant').on(t.tenantId),
  index('idx_wf_inst_entity').on(t.entityType, t.entityId),
]);

export const wfTransitions = table('wf_transitions', {
  id: serial('id').primaryKey(),
  instanceId: integer('instance_id').notNull(),
  fromState: text('from_state').notNull(),
  toState: text('to_state').notNull(),
  trigger: text('trigger').notNull(),
  actorId: varchar('actor_id'),
  payload: jsonb('payload'),
  occurredAt: timestamp('occurred_at').defaultNow(),
});

export const wfTasks = table('wf_tasks', {
  id: serial('id').primaryKey(),
  instanceId: integer('instance_id').notNull(),
  state: text('state').notNull(),
  assigneeId: varchar('assignee_id'),
  role: text('role'),
  dueAt: timestamp('due_at'),
  status: text('status').notNull().default('open'),
  claimedAt: timestamp('claimed_at'),
  completedAt: timestamp('completed_at'),
}, (t) => [
  index('idx_wf_task_assignee').on(t.assigneeId),
  index('idx_wf_task_status').on(t.status),
]);

export const wfSlas = table('wf_slas', {
  id: serial('id').primaryKey(),
  defId: integer('def_id').notNull(),
  state: text('state').notNull(),
  thresholdSeconds: integer('threshold_seconds').notNull(),
  policy: jsonb('policy'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wfEscalations = table('wf_escalations', {
  id: serial('id').primaryKey(),
  instanceId: integer('instance_id').notNull(),
  state: text('state').notNull(),
  level: integer('level').notNull(),
  sentAt: timestamp('sent_at').defaultNow(),
  target: text('target').notNull(),
  channel: text('channel').notNull(),
  meta: jsonb('meta'),
});

export const wfWebhooks = table('wf_webhooks', {
  id: serial('id').primaryKey(),
  defId: integer('def_id').notNull(),
  event: text('event').notNull(),
  url: text('url').notNull(),
  secret: text('secret'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wfSignals = table('wf_signals', {
  id: serial('id').primaryKey(),
  instanceId: integer('instance_id').notNull(),
  signal: text('signal').notNull(),
  payload: jsonb('payload'),
  receivedAt: timestamp('received_at').defaultNow(),
});

// ============ GROUNDWATER & AQUIFER MANAGEMENT ============

export const aquifers = table('aquifers', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  areaKm2: integer('area_km2'),
  safeYieldMcm: integer('safe_yield_mcm'),
  currentYieldMcm: integer('current_yield_mcm'),
  rechargeRateMcm: integer('recharge_rate_mcm'),
  averageDepth: integer('average_depth'),
  geologyType: text('geology_type'),
  waterQualityStatus: text('water_quality_status'),
  riskLevel: text('risk_level'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_aquifer_tenant').on(t.tenantId),
  index('idx_aquifer_risk').on(t.riskLevel),
]);

export const groundwaterMonitoring = table('groundwater_monitoring', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  aquiferId: integer('aquifer_id').notNull(),
  boreholeId: varchar('borehole_id'),
  staticLevel: integer('static_level'),
  dynamicLevel: integer('dynamic_level'),
  yieldLpm: integer('yield_lpm'),
  chloride: integer('chloride'),
  fluoride: integer('fluoride'),
  nitrate: integer('nitrate'),
  ph: text('ph'),
  abstraction: integer('abstraction'),
  recordedAt: timestamp('recorded_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_gw_mon_aquifer').on(t.aquiferId),
  index('idx_gw_mon_borehole').on(t.boreholeId),
]);

export const droughtEvents = table('drought_events', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('declared'),
  severity: text('severity').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  affectedArea: text('affected_area'),
  activatedBoreholes: integer('activated_boreholes'),
  affectedPopulation: integer('affected_population'),
  waterRationing: boolean('water_rationing').default(false),
  deploymentNotes: text('deployment_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_drought_tenant').on(t.tenantId),
  index('idx_drought_status').on(t.status),
]);

export const genderEquityTracking = table('gender_equity_tracking', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: varchar('entity_id').notNull(),
  gender: text('gender'),
  ageGroup: text('age_group'),
  vulnerabilityCategory: text('vulnerability_category'),
  accessType: text('access_type'),
  waterHoursPerDay: integer('water_hours_per_day'),
  collectionTimeMinutes: integer('collection_time_minutes'),
  satisfactionRating: integer('satisfaction_rating'),
  recordedAt: timestamp('recorded_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_gender_tenant').on(t.tenantId),
  index('idx_gender_entity').on(t.entityType, t.entityId),
  index('idx_gender_vulnerability').on(t.vulnerabilityCategory),
]);

export const competencyAssessments = table('competency_assessments', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  operatorId: varchar('operator_id').notNull(),
  assessmentType: text('assessment_type').notNull(),
  topic: text('topic').notNull(),
  score: integer('score'),
  maxScore: integer('max_score'),
  status: text('status').notNull().default('pending'),
  certificationValid: boolean('certification_valid').default(false),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  assessedBy: varchar('assessed_by'),
  assessedAt: timestamp('assessed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_comp_tenant').on(t.tenantId),
  index('idx_comp_operator').on(t.operatorId),
  index('idx_comp_valid').on(t.certificationValid),
]);

export const vulnerableGroups = table('vulnerable_groups', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: varchar('scheme_id').notNull(),
  groupType: text('group_type').notNull(),
  groupName: text('group_name'),
  populationCount: integer('population_count'),
  accessChallenges: text('access_challenges'),
  supportProvided: text('support_provided'),
  priorityLevel: text('priority_level'),
  contactPerson: text('contact_person'),
  recordedAt: timestamp('recorded_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_vuln_tenant').on(t.tenantId),
  index('idx_vuln_scheme').on(t.schemeId),
  index('idx_vuln_type').on(t.groupType),
]);

// ============ COMMUNITY & STAKEHOLDER MODULE ============

export const committees = table('committees', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: varchar('scheme_id'),
  name: text('name').notNull(),
  communityName: text('community_name'),
  bylaws: jsonb('bylaws'),
  termStart: timestamp('term_start').notNull(),
  termEnd: timestamp('term_end').notNull(),
  quotas: jsonb('quotas'),
  status: text('status').notNull().default('active'),
  lastElectionDate: timestamp('last_election_date'),
  complianceScore: integer('compliance_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_committee_tenant').on(t.tenantId),
  index('idx_committee_status').on(t.status),
]);

export const committeeMembers = table('committee_members', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  committeeId: varchar('committee_id').notNull(),
  name: text('name').notNull(),
  idNumber: text('id_number'),
  phone: text('phone'),
  email: text('email'),
  role: text('role').notNull().default('member'),
  gender: text('gender'),
  termStart: timestamp('term_start').notNull(),
  termEnd: timestamp('term_end'),
  photoKey: text('photo_key'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_cmember_tenant').on(t.tenantId),
  index('idx_cmember_committee').on(t.committeeId),
]);

export const committeeMeetings = table('committee_meetings', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  committeeId: varchar('committee_id').notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  venue: text('venue'),
  agenda: jsonb('agenda'),
  minutes: text('minutes'),
  attendance: jsonb('attendance'),
  quorumRequired: integer('quorum_required').default(5),
  membersPresent: integer('members_present').default(0),
  quorumMet: boolean('quorum_met').default(false),
  resolutions: jsonb('resolutions'),
  actionItems: jsonb('action_items'),
  status: text('status').notNull().default('scheduled'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_cmeet_tenant').on(t.tenantId),
  index('idx_cmeet_committee').on(t.committeeId),
]);

export const committeeCashbook = table('committee_cashbook', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  committeeId: varchar('committee_id').notNull(),
  entryDate: timestamp('entry_date').notNull(),
  refNo: text('ref_no'),
  particulars: text('particulars').notNull(),
  entryType: text('entry_type').notNull(),
  amount: integer('amount').notNull(),
  fundSource: text('fund_source'),
  ledgerAccount: text('ledger_account'),
  attachmentKey: text('attachment_key'),
  approvedBy: varchar('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_ccash_tenant').on(t.tenantId),
  index('idx_ccash_committee').on(t.committeeId),
]);

export const committeeAudits = table('committee_audits', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  committeeId: varchar('committee_id').notNull(),
  auditPeriod: text('audit_period').notNull(),
  findings: jsonb('findings'),
  recommendations: jsonb('recommendations'),
  status: text('status').notNull().default('draft'),
  auditedBy: varchar('audited_by'),
  auditedAt: timestamp('audited_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_audit_tenant').on(t.tenantId),
  index('idx_audit_committee').on(t.committeeId),
]);

export const vendors = table('vendors', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  companyName: text('company_name').notNull(),
  registrationNumber: text('registration_number'),
  contactName: text('contact_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  profile: jsonb('profile'),
  kyc: jsonb('kyc'),
  categories: jsonb('categories'),
  bankInfo: jsonb('bank_info'),
  status: text('status').notNull().default('pending'),
  kycStatus: text('kyc_status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_vendor_tenant').on(t.tenantId),
  index('idx_vendor_status').on(t.status),
]);

export const bids = table('bids', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  rfqId: varchar('rfq_id').notNull(),
  vendorId: varchar('vendor_id').notNull(),
  items: jsonb('items'),
  priceTotal: integer('price_total'),
  leadTimeDays: integer('lead_time_days'),
  attachments: jsonb('attachments'),
  status: text('status').notNull().default('submitted'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_bid_tenant').on(t.tenantId),
  index('idx_bid_rfq').on(t.rfqId),
  index('idx_bid_vendor').on(t.vendorId),
]);

export const deliveries = table('deliveries', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  poId: varchar('po_id').notNull(),
  vendorId: varchar('vendor_id').notNull(),
  items: jsonb('items'),
  docs: jsonb('docs'),
  status: text('status').notNull().default('pending'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_deliv_tenant').on(t.tenantId),
  index('idx_deliv_po').on(t.poId),
  index('idx_deliv_vendor').on(t.vendorId),
]);

export const invoices = table('invoices', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  vendorId: varchar('vendor_id').notNull(),
  poId: varchar('po_id'),
  invoiceNumber: text('invoice_number').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('KES'),
  status: text('status').notNull().default('submitted'),
  approvals: jsonb('approvals'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_inv_tenant').on(t.tenantId),
  index('idx_inv_vendor').on(t.vendorId),
  index('idx_inv_status').on(t.status),
]);

export const stakeholders = table('stakeholders', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  stakeholderType: text('stakeholder_type').notNull(),
  contactName: text('contact_name').notNull(),
  organization: text('organization'),
  email: text('email'),
  phone: text('phone'),
  influence: integer('influence'),
  interest: integer('interest'),
  tags: jsonb('tags'),
  consentFlags: jsonb('consent_flags'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_stake_tenant').on(t.tenantId),
  index('idx_stake_type').on(t.stakeholderType),
]);

export const engagements = table('engagements', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  title: text('title').notNull(),
  audience: jsonb('audience'),
  channel: text('channel'),
  location: text('location'),
  scheduledAt: timestamp('scheduled_at'),
  outcomes: jsonb('outcomes'),
  attendeeCount: integer('attendee_count'),
  status: text('status').notNull().default('planned'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_engage_tenant').on(t.tenantId),
  index('idx_engage_status').on(t.status),
]);

export const grievances = table('grievances', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  ticketNumber: text('ticket_number').notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull(),
  status: text('status').notNull().default('new'),
  location: text('location'),
  reporterEmail: text('reporter_email'),
  details: text('details'),
  slaDueAt: timestamp('sla_due_at'),
  resolution: jsonb('resolution'),
  evidence: jsonb('evidence'),
  signoff: jsonb('signoff'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_griev_tenant').on(t.tenantId),
  index('idx_griev_status').on(t.status),
  index('idx_griev_category').on(t.category),
]);

export const datasets = table('datasets', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar('tenant_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  license: text('license').default('CC BY 4.0'),
  sourceRef: text('source_ref'),
  transformJson: jsonb('transform_json'),
  refreshCron: text('refresh_cron'),
  visibility: text('visibility').notNull().default('private'),
  apiSlug: text('api_slug').unique(),
  downloadCount: integer('download_count').default(0),
  rating: integer('rating').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_dataset_tenant').on(t.tenantId),
  index('idx_dataset_visibility').on(t.visibility),
]);

// ============ PHASE 1-2: CORE REGISTRY & OPERATIONS ============

// Phase 1: Schemes & Topology
export const schemes = table('schemes', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'piped'|'handpump'|'borehole'|'spring'
  status: text('status').notNull().default('active'), // 'planning'|'active'|'suspended'|'decommissioned'
  ownership: text('ownership').notNull().default('public'), // 'public'|'private'|'community'
  county: text('county'),
  subcounty: text('subcounty'),
  populationServed: integer('population_served'),
  connections: integer('connections'),
  designCapacityM3: integer('design_capacity_m3'),
  sourceType: text('source_type'), // 'groundwater'|'surface'|'rainwater'
  administrationNotes: text('administration_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_scheme_tenant').on(t.tenantId),
  index('idx_scheme_code').on(t.code),
  index('idx_scheme_status').on(t.status),
]);

export const dmas = table('dmas', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: integer('scheme_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_dma_tenant').on(t.tenantId),
  index('idx_dma_scheme').on(t.schemeId),
]);

export const networkNodes = table('network_nodes', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: integer('scheme_id').notNull(),
  nodeType: text('node_type').notNull(), // 'source'|'reservoir'|'junction'|'treatment'|'pump_station'
  code: text('code').notNull(),
  name: text('name'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  elevation: integer('elevation'),
  properties: jsonb('properties'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_node_tenant').on(t.tenantId),
  index('idx_node_scheme').on(t.schemeId),
  index('idx_node_type').on(t.nodeType),
]);

export const networkEdges = table('network_edges', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: integer('scheme_id').notNull(),
  fromNodeId: integer('from_node_id').notNull(),
  toNodeId: integer('to_node_id').notNull(),
  assetId: integer('asset_id'),
  edgeOrder: integer('edge_order'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_edge_tenant').on(t.tenantId),
  index('idx_edge_scheme').on(t.schemeId),
]);

// Phase 1: Asset Types & Assets
export const assetTypes = table('asset_types', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  name: text('name').notNull().unique(),
  description: text('description'),
  jsonSchema: jsonb('json_schema'), // Dynamic field spec
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_assettype_tenant').on(t.tenantId),
]);

export const assets = table('assets', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  assetTypeId: integer('asset_type_id').notNull(),
  schemeId: integer('scheme_id').notNull(),
  code: text('code').notNull(),
  name: text('name'),
  status: text('status').notNull().default('operational'), // 'operational'|'faulty'|'maintenance'|'decommissioned'
  condition: text('condition').default('good'), // 'good'|'fair'|'poor'|'critical'
  latitude: text('latitude'),
  longitude: text('longitude'),
  specifications: jsonb('specifications'),
  installationDate: timestamp('installation_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_asset_tenant').on(t.tenantId),
  index('idx_asset_scheme').on(t.schemeId),
  index('idx_asset_type').on(t.assetTypeId),
  index('idx_asset_status').on(t.status),
]);

// Phase 1: Meters
export const meters = table('meters', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  assetId: integer('asset_id').notNull(),
  meterType: text('meter_type').notNull(), // 'consumer'|'bulk'|'point_of_use'
  serialNumber: text('serial_number').notNull(),
  accuracyClass: text('accuracy_class'), // 'Class A'|'Class B'
  installationDate: timestamp('installation_date'),
  lastReading: integer('last_reading'),
  lastReadDate: timestamp('last_read_date'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_meter_tenant').on(t.tenantId),
  index('idx_meter_asset').on(t.assetId),
]);

// Phase 2: Telemetry & SCADA
export const telemetryTags = table('telemetry_tags', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  tag: text('tag').notNull().unique(),
  ioType: text('io_type').notNull(), // 'AI'|'DI'|'AO'|'DO'
  unit: text('unit'), // 'bar'|'lpm'|'m3'|'°C'|'on/off'
  scale: jsonb('scale'), // {min, max, offset}
  thresholds: jsonb('thresholds'), // {critical_low, warning_low, warning_high, critical_high}
  assetId: integer('asset_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_telemetry_tenant').on(t.tenantId),
  index('idx_telemetry_tag').on(t.tag),
  index('idx_telemetry_asset').on(t.assetId),
]);

export const telemetryMeasurements = table('telemetry_measurements', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  telemetryTagId: integer('telemetry_tag_id').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  value: text('value').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_measure_tenant').on(t.tenantId),
  index('idx_measure_tag').on(t.telemetryTagId),
  index('idx_measure_time').on(t.timestamp),
]);

// Phase 2: Pump Scheduling
export const pumpSchedules = table('pump_schedules', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  assetId: integer('asset_id').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  constraints: jsonb('constraints'), // {reservoir_targets, tariff_bands, max_run_hours}
  status: text('status').notNull().default('scheduled'), // 'scheduled'|'active'|'completed'
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_schedule_tenant').on(t.tenantId),
  index('idx_schedule_asset').on(t.assetId),
  index('idx_schedule_status').on(t.status),
]);

// Phase 2: Outages
export const outages = table('outages', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: integer('scheme_id').notNull(),
  cause: text('cause').notNull(), // 'planned'|'fault'|'water_quality'|'power'|'other'
  state: text('state').notNull().default('draft'), // draft → approved → live → restored → closed
  reason: text('reason'),
  scheduledStart: timestamp('scheduled_start'),
  scheduledEnd: timestamp('scheduled_end'),
  actualStart: timestamp('actual_start'),
  actualEnd: timestamp('actual_end'),
  estimatedAffectedPopulation: integer('estimated_affected_population'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_outage_tenant').on(t.tenantId),
  index('idx_outage_scheme').on(t.schemeId),
  index('idx_outage_state').on(t.state),
]);

export const outageAudits = table('outage_audits', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  outageId: integer('outage_id').notNull(),
  action: text('action').notNull(), // 'created'|'approved'|'activated'|'resolved'|'closed'
  notes: text('notes'),
  userId: varchar('user_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_outage_audit_tenant').on(t.tenantId),
  index('idx_outage_audit_outage').on(t.outageId),
]);

// Phase 2: Dosing Control
export const dosePlans = table('dose_plans', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: integer('scheme_id').notNull(),
  assetId: integer('asset_id').notNull(),
  flowBands: jsonb('flow_bands').notNull(), // [{min_lps, max_lps, target_mg_l}]
  alarms: jsonb('alarms'), // {residual_low, residual_high, flow_high}
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_dose_tenant').on(t.tenantId),
  index('idx_dose_scheme').on(t.schemeId),
  index('idx_dose_asset').on(t.assetId),
]);

export const chemicalStocks = table('chemical_stocks', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: integer('scheme_id').notNull(),
  chemical: text('chemical').notNull(), // 'alum'|'chlorine'|'lime'
  quantityL: integer('quantity_l').notNull(),
  unitCost: integer('unit_cost'),
  supplier: text('supplier'),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_stock_tenant').on(t.tenantId),
  index('idx_stock_scheme').on(t.schemeId),
]);

export const doseChangeLogs = table('dose_change_logs', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  dosePlanId: integer('dose_plan_id').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  oldDose: text('old_dose'),
  newDose: text('new_dose').notNull(),
  userId: varchar('user_id'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_doselog_tenant').on(t.tenantId),
  index('idx_doselog_plan').on(t.dosePlanId),
]);

// Phase 2: Pressure & Leak Reports
export const pressureLeakReports = table('pressure_leak_reports', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  dmaId: integer('dma_id').notNull(),
  reportType: text('report_type').notNull(), // 'pressure_drop'|'leak_detected'|'burst'
  severity: text('severity').notNull(), // 'low'|'medium'|'high'|'critical'
  location: text('location'),
  description: text('description'),
  reportedAt: timestamp('reported_at').notNull(),
  status: text('status').notNull().default('open'), // 'open'|'investigating'|'resolved'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_report_tenant').on(t.tenantId),
  index('idx_report_dma').on(t.dmaId),
  index('idx_report_status').on(t.status),
]);

// ============ PHASE 3: PREDICTIVE ANALYTICS & ML ============

export const predictions = table('predictions', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  entityType: text('entity_type').notNull(), // 'asset'|'dma'|'scheme'
  entityId: varchar('entity_id').notNull(),
  predictionType: text('prediction_type').notNull(), // 'failure'|'nrw_anomaly'|'demand'|'schedule'|'outage'
  predictedValue: jsonb('predicted_value').notNull(), // Depends on type
  confidence: integer('confidence').default(0), // 0-100
  metadata: jsonb('metadata'), // Model version, algorithm, training data timestamp
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // When prediction becomes stale
}, (t) => [
  index('idx_pred_tenant').on(t.tenantId),
  index('idx_pred_entity').on(t.entityType, t.entityId),
  index('idx_pred_type').on(t.predictionType),
  index('idx_pred_expires').on(t.expiresAt),
]);

export const anomalyEvents = table('anomaly_events', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  entityType: text('entity_type').notNull(), // 'dma'|'scheme'
  entityId: varchar('entity_id').notNull(),
  anomalyType: text('anomaly_type').notNull(), // 'nrw_spike'|'demand_anomaly'|'pressure_drop'
  anomalyScore: integer('anomaly_score'), // 0-100 (severity)
  severity: text('severity').notNull(), // 'low'|'medium'|'high'|'critical'
  details: jsonb('details').notNull(), // Context (actual vs baseline, etc)
  investigatedAt: timestamp('investigated_at'),
  resolution: jsonb('resolution'), // Action taken, outcome
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_anom_tenant').on(t.tenantId),
  index('idx_anom_entity').on(t.entityType, t.entityId),
  index('idx_anom_severity').on(t.severity),
  index('idx_anom_created').on(t.createdAt),
]);

export const forecastData = table('forecast_data', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  schemeId: varchar('scheme_id').notNull(),
  forecastDate: timestamp('forecast_date').notNull(), // Date being forecasted
  forecastType: text('forecast_type').notNull(), // 'demand'|'supply'|'pressure'
  value: integer('value').notNull(), // Predicted value
  lower: integer('lower'), // Confidence interval lower bound
  upper: integer('upper'), // Confidence interval upper bound
  confidence: integer('confidence').default(0), // 0-100
  modelVersion: text('model_version'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_forecast_tenant').on(t.tenantId),
  index('idx_forecast_scheme').on(t.schemeId),
  index('idx_forecast_date').on(t.forecastDate),
  index('idx_forecast_type').on(t.forecastType),
]);

export const nrwSnapshots = table('nrw_snapshots', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  dmaId: varchar('dma_id').notNull(),
  asOf: timestamp('as_of').notNull(),
  systemInputVolumeMc: integer('system_input_volume_m3').notNull(), // System input in m³
  billedAuthorizedMc: integer('billed_authorized_m3').notNull(), // Billed volume
  waterLossMc: integer('water_loss_m3'), // Calculated loss
  nrwPercentage: integer('nrw_percentage'), // (Loss/Input) * 100
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_nrw_tenant').on(t.tenantId),
  index('idx_nrw_dma').on(t.dmaId),
  index('idx_nrw_date').on(t.asOf),
]);

export const interventions = table('interventions', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  dmaId: varchar('dma_id').notNull(),
  type: text('type').notNull(), // 'leak_detection'|'meter_audit'|'pressure_mgmt'|'metering'
  status: text('status').notNull().default('planned'), // 'planned'|'ongoing'|'completed'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  estimatedCost: integer('estimated_cost'),
  actualCost: integer('actual_cost'),
  impactNrwReduction: integer('impact_nrw_reduction'), // % reduction expected
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_int_tenant').on(t.tenantId),
  index('idx_int_dma').on(t.dmaId),
  index('idx_int_status').on(t.status),
]);

// ============ SETTINGS & CONFIGURATION ============

export const moduleSettings = table('module_settings', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  moduleKey: text('module_key').notNull(), // 'core-registry', 'core-ops', 'crm', 'risk-compliance', etc.
  moduleName: text('module_name').notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
  description: text('description'),
  icon: text('icon'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  uniqueIndex('idx_module_settings_tenant_key').on(t.tenantId, t.moduleKey),
  index('idx_module_settings_enabled').on(t.isEnabled),
]);

export const roleModuleAccess = table('role_module_access', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  roleId: varchar('role_id').notNull(),
  moduleKey: text('module_key').notNull(), // references moduleSettings.moduleKey
  hasAccess: boolean('has_access').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  uniqueIndex('idx_role_module_access_tenant_role_module').on(t.tenantId, t.roleId, t.moduleKey),
  index('idx_role_module_access_role').on(t.roleId),
  index('idx_role_module_access_module').on(t.moduleKey),
]);

// ============ INTEGRATION HUB - API GATEWAY ============

export const apiKeys = table('api_keys', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  keyId: text('key_id').notNull().unique(),
  keySecret: text('key_secret').notNull(),
  appName: text('app_name').notNull(),
  description: text('description'),
  scopes: jsonb('scopes'), // ['read:telemetry', 'write:work-orders']
  rateLimit: integer('rate_limit').default(1000), // requests per hour
  isActive: boolean('is_active').notNull().default(true),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow(),
  rotatedAt: timestamp('rotated_at').defaultNow(),
}, (t) => [
  index('idx_api_keys_tenant').on(t.tenantId),
  index('idx_api_keys_active').on(t.isActive),
]);

export const oauthClients = table('oauth_clients', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  clientId: text('client_id').notNull().unique(),
  clientSecret: text('client_secret').notNull(),
  clientName: text('client_name').notNull(),
  redirectUris: jsonb('redirect_uris').notNull(), // ['https://app.example.com/callback']
  scopes: jsonb('scopes').notNull(), // ['openid', 'profile', 'email']
  grantTypes: jsonb('grant_types').notNull(), // ['authorization_code', 'refresh_token']
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_oauth_clients_tenant').on(t.tenantId),
  index('idx_oauth_clients_active').on(t.isActive),
]);

export const webhooks = table('webhooks', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  secret: text('secret').notNull(), // for HMAC signing
  eventTopics: jsonb('event_topics').notNull(), // ['telemetry.ingest', 'billing.posted']
  retryPolicy: jsonb('retry_policy'), // { maxRetries: 3, backoffMs: 1000 }
  isActive: boolean('is_active').notNull().default(true),
  testEventSent: timestamp('test_event_sent'),
  lastDeliveryAt: timestamp('last_delivery_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_webhooks_tenant').on(t.tenantId),
  index('idx_webhooks_active').on(t.isActive),
]);

export const apiAuditLog = table('api_audit_log', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  userId: varchar('user_id'),
  statusCode: integer('status_code'),
  latencyMs: integer('latency_ms'),
  errorMessage: text('error_message'),
  requestSize: integer('request_size'),
  responseSize: integer('response_size'),
  timestamp: timestamp('timestamp').defaultNow(),
}, (t) => [
  index('idx_api_audit_tenant').on(t.tenantId),
  index('idx_api_audit_timestamp').on(t.timestamp),
]);

// ============ INTEGRATION HUB - EVENT BUS ============

export const eventTopics = table('event_topics', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  topicName: text('topic_name').notNull(),
  description: text('description'),
  schema: jsonb('schema'), // JSON schema for validation
  retentionDays: integer('retention_days').default(90),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  uniqueIndex('idx_event_topics_tenant_name').on(t.tenantId, t.topicName),
  index('idx_event_topics_active').on(t.isActive),
]);

export const eventSubscriptions = table('event_subscriptions', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  topicId: integer('topic_id').notNull(),
  consumerName: text('consumer_name').notNull(),
  consumerType: text('consumer_type').notNull(), // 'webhook'|'queue'|'stream'
  consumerConfig: jsonb('consumer_config'), // {url, retryPolicy}
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_subscriptions_tenant').on(t.tenantId),
  index('idx_subscriptions_topic').on(t.topicId),
]);

export const eventLog = table('event_log', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  topicId: integer('topic_id').notNull(),
  eventPayload: jsonb('event_payload').notNull(),
  deliveryStatus: text('delivery_status').notNull(), // 'pending'|'delivered'|'failed'|'dlq'
  deliveryAttempts: integer('delivery_attempts').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  deliveredAt: timestamp('delivered_at'),
}, (t) => [
  index('idx_event_log_tenant').on(t.tenantId),
  index('idx_event_log_status').on(t.deliveryStatus),
]);

// ============ MASTER DATA MANAGEMENT ============

export const mdmEntities = table('mdm_entities', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  entityType: text('entity_type').notNull(), // 'customer'|'asset'|'location'|'vendor'
  sourceSystem: text('source_system').notNull(),
  sourceId: text('source_id').notNull(),
  goldenRecord: jsonb('golden_record'), // merged fields
  trustScore: integer('trust_score').default(50), // 0-100
  status: text('status').notNull().default('active'), // 'active'|'merged'|'deleted'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  uniqueIndex('idx_mdm_entities_source').on(t.tenantId, t.sourceSystem, t.sourceId),
  index('idx_mdm_entities_type').on(t.entityType),
  index('idx_mdm_entities_status').on(t.status),
]);

export const mdmMatches = table('mdm_matches', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  entityAId: integer('entity_a_id').notNull(),
  entityBId: integer('entity_b_id').notNull(),
  similarityScore: integer('similarity_score'), // 0-100
  matchType: text('match_type').notNull(), // 'phonetic'|'fuzzy'|'exact'
  autoApproved: boolean('auto_approved').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_mdm_matches_tenant').on(t.tenantId),
  index('idx_mdm_matches_score').on(t.similarityScore),
]);

export const mdmMerges = table('mdm_merges', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  winningEntityId: integer('winning_entity_id').notNull(),
  losingEntityId: integer('losing_entity_id').notNull(),
  mergeData: jsonb('merge_data'), // { fieldName: { fromValue, toValue } }
  approvedBy: varchar('approved_by'),
  approvedAt: timestamp('approved_at'),
  reversibleUntil: timestamp('reversible_until'),
  isReversed: boolean('is_reversed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  index('idx_mdm_merges_tenant').on(t.tenantId),
  index('idx_mdm_merges_winning').on(t.winningEntityId),
]);

export const mdmRules = table('mdm_rules', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  entityType: text('entity_type').notNull(),
  survivorshipRule: text('survivorship_rule').notNull(), // 'priority'|'most_recent'|'longest'
  matchThreshold: integer('match_threshold').default(75), // minimum similarity %
  blockingKeys: jsonb('blocking_keys'), // fields that must match exactly
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  uniqueIndex('idx_mdm_rules_tenant_type').on(t.tenantId, t.entityType),
]);

// ============ IDENTITY & ACCESS - SSO/MFA/ABAC ============

export const ssoProviders = table('sso_providers', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  providerType: text('provider_type').notNull(), // 'oidc'|'saml'
  providerName: text('provider_name').notNull(),
  issuer: text('issuer').notNull(),
  clientId: text('client_id').notNull(),
  clientSecret: text('client_secret').notNull(),
  authorizationEndpoint: text('authorization_endpoint'),
  tokenEndpoint: text('token_endpoint'),
  userInfoEndpoint: text('user_info_endpoint'),
  certificate: text('certificate'), // for SAML
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  uniqueIndex('idx_sso_providers_tenant_issuer').on(t.tenantId, t.issuer),
  index('idx_sso_providers_active').on(t.isActive),
]);

export const mfaSettings = table('mfa_settings', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  enforcementPolicy: text('enforcement_policy').notNull(), // 'optional'|'recommended'|'required'
  allowedMethods: jsonb('allowed_methods').notNull(), // ['totp', 'sms', 'email']
  gracePeriodDays: integer('grace_period_days').default(7),
  totpIssuer: text('totp_issuer').default('Water Utility MIS'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_mfa_settings_tenant').on(t.tenantId),
]);

export const abacPolicies = table('abac_policies', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  policyName: text('policy_name').notNull(),
  description: text('description'),
  effect: text('effect').notNull(), // 'allow'|'deny'
  priority: integer('priority').default(100),
  conditionJson: jsonb('condition_json').notNull(), // {attribute, operator, value}
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [
  index('idx_abac_policies_tenant').on(t.tenantId),
  index('idx_abac_policies_priority').on(t.priority),
]);

export const loginAudit = table('login_audit', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id').notNull(),
  userId: varchar('user_id').notNull(),
  status: text('status').notNull(), // 'success'|'failed'|'mfa_required'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  mfaUsed: boolean('mfa_used').notNull().default(false),
  mfaMethod: text('mfa_method'), // 'totp'|'sms'|'email'
  failureReason: text('failure_reason'),
  timestamp: timestamp('timestamp').defaultNow(),
}, (t) => [
  index('idx_login_audit_tenant').on(t.tenantId),
  index('idx_login_audit_user').on(t.userId),
  index('idx_login_audit_timestamp').on(t.timestamp),
]);
