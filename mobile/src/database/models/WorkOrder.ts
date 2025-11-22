import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class WorkOrder extends Model {
  static table = 'work_orders';

  @field('server_id') serverId!: string;
  @field('code') code!: string;
  @field('title') title!: string;
  @field('description') description?: string;
  @field('status') status!: string;
  @field('priority') priority!: string;
  @field('assigned_to') assignedTo?: string;
  @field('due_date') dueDate?: number;
  @field('tenant_id') tenantId!: string;
  @field('synced_at') syncedAt?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
