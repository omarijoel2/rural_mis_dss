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

import { varchar, jsonb, timestamp, index, uniqueIndex, pgTable as table } from "drizzle-orm/pg-core";

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
