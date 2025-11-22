import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Asset extends Model {
  static table = 'assets';

  @field('server_id') serverId!: string;
  @field('asset_tag') assetTag!: string;
  @field('name') name!: string;
  @field('category') category!: string;
  @field('status') status!: string;
  @field('location') location?: string;
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;
  @field('tenant_id') tenantId!: string;
  @field('synced_at') syncedAt?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
