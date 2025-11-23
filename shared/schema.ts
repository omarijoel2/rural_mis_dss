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
