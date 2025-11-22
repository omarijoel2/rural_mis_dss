import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Customer from './models/Customer';
import WorkOrder from './models/WorkOrder';
import Asset from './models/Asset';
import WaterQualityTest from './models/WaterQualityTest';
import SyncQueue from './models/SyncQueue';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'RuralWaterMIS',
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [
    Customer,
    WorkOrder,
    Asset,
    WaterQualityTest,
    SyncQueue,
  ],
});
