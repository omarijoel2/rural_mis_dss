import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string(),
  account_number: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone_number: z.string().nullable(),
  address: z.string().nullable(),
  status: z.enum(['active', 'suspended', 'disconnected']),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const WorkOrderSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigned_to: z.string().nullable(),
  due_date: z.string().nullable(),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AssetSchema = z.object({
  id: z.string(),
  asset_tag: z.string(),
  name: z.string(),
  category: z.string(),
  status: z.enum(['operational', 'maintenance', 'repair', 'decommissioned']),
  location: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const WaterQualityTestSchema = z.object({
  id: z.string(),
  sample_id: z.string(),
  location: z.string(),
  ph: z.number().nullable(),
  turbidity: z.number().nullable(),
  chlorine: z.number().nullable(),
  e_coli: z.string().nullable(),
  test_date: z.string(),
  tested_by: z.string(),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type WorkOrder = z.infer<typeof WorkOrderSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type WaterQualityTest = z.infer<typeof WaterQualityTestSchema>;
