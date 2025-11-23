import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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

import { varchar, jsonb, timestamp, index, uniqueIndex, pgTable as table, sql } from "drizzle-orm/pg-core";

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
