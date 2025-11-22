import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Customer extends Model {
  static table = 'customers';

  @field('server_id') serverId!: string;
  @field('account_number') accountNumber!: string;
  @field('name') name!: string;
  @field('email') email?: string;
  @field('phone_number') phoneNumber?: string;
  @field('address') address?: string;
  @field('status') status!: string;
  @field('tenant_id') tenantId!: string;
  @field('synced_at') syncedAt?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
