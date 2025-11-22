import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class SyncQueue extends Model {
  static table = 'sync_queue';

  @field('table_name') tableName!: string;
  @field('record_id') recordId!: string;
  @field('operation') operation!: string;
  @field('changes') changes!: string;
  @field('tenant_id') tenantId!: string;
  @field('retry_count') retryCount!: number;
  @readonly @date('created_at') createdAt!: Date;
}
