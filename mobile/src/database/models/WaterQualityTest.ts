import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class WaterQualityTest extends Model {
  static table = 'water_quality_tests';

  @field('server_id') serverId!: string;
  @field('sample_id') sampleId!: string;
  @field('location') location!: string;
  @field('ph') ph?: number;
  @field('turbidity') turbidity?: number;
  @field('chlorine') chlorine?: number;
  @field('e_coli') eColi?: string;
  @field('test_date') testDate!: number;
  @field('tested_by') testedBy!: string;
  @field('tenant_id') tenantId!: string;
  @field('synced_at') syncedAt?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
