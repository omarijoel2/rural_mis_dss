import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import WaterQualityTest from '../database/models/WaterQualityTest';
import { syncEngine } from '../lib/sync-engine';
import { useAuthStore } from '../lib/auth-store';

interface SerializedWaterQualityTest {
  id: string;
  serverId: string;
  sampleId: string;
  location: string;
  ph?: number;
  turbidity?: number;
  chlorine?: number;
  eColi?: string;
  testDate: Date;
  testedBy: string;
  tenantId: string;
  syncedAt?: number;
  createdAt: Date;
  updatedAt: Date;
}

function serializeWaterQualityTest(test: WaterQualityTest): SerializedWaterQualityTest {
  return {
    id: test.id,
    serverId: test.serverId,
    sampleId: test.sampleId,
    location: test.location,
    ph: test.ph,
    turbidity: test.turbidity,
    chlorine: test.chlorine,
    eColi: test.eColi,
    testDate: test.testDate,
    testedBy: test.testedBy,
    tenantId: test.tenantId,
    syncedAt: test.syncedAt,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
  };
}

export function useWaterQualityTests() {
  const { activeTenant } = useAuthStore();

  return useQuery({
    queryKey: ['water-quality-tests', activeTenant?.id],
    queryFn: async () => {
      const testsCollection = database.get<WaterQualityTest>('water_quality_tests');
      
      const tests = await testsCollection
        .query(Q.where('tenant_id', activeTenant?.id || ''))
        .fetch();

      return tests.map(serializeWaterQualityTest);
    },
    enabled: !!activeTenant,
  });
}

export function useWaterQualityTest(id: string) {
  const { activeTenant } = useAuthStore();

  return useQuery({
    queryKey: ['water-quality-test', id],
    queryFn: async () => {
      const testsCollection = database.get<WaterQualityTest>('water_quality_tests');
      const test = await testsCollection.find(id);
      
      if (test.tenantId !== activeTenant?.id) {
        throw new Error('Water quality test not found in active tenant');
      }
      
      return serializeWaterQualityTest(test);
    },
    enabled: !!activeTenant,
  });
}

export function useCreateWaterQualityTest() {
  const queryClient = useQueryClient();
  const { activeTenant, user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Partial<SerializedWaterQualityTest>) => {
      const testsCollection = database.get<WaterQualityTest>('water_quality_tests');

      let newTest: WaterQualityTest | null = null;

      await database.write(async () => {
        newTest = await testsCollection.create((test) => {
          test.serverId = `local-${Date.now()}`;
          test.sampleId = data.sampleId || `S-${Date.now()}`;
          test.location = data.location || '';
          test.ph = data.ph;
          test.turbidity = data.turbidity;
          test.chlorine = data.chlorine;
          test.eColi = data.eColi;
          test.testDate = data.testDate || new Date();
          test.testedBy = user?.name || 'Unknown';
          test.tenantId = activeTenant?.id || '';
        });
      });

      if (newTest) {
        await syncEngine.queueMutation(
          'water_quality_tests',
          newTest.serverId,
          'create',
          data as Record<string, unknown>,
          activeTenant?.id || ''
        );
      }

      return newTest ? serializeWaterQualityTest(newTest) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-tests'] });
    },
  });
}

export function useSyncWaterQualityTests() {
  const queryClient = useQueryClient();
  const { activeTenant } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!activeTenant) throw new Error('No active tenant');
      await syncEngine.processSyncQueue(activeTenant.id);
      await syncEngine.pullWaterQualityTestsFromServer(activeTenant.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-quality-tests'] });
    },
  });
}
