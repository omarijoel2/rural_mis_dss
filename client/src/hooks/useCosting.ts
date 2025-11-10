import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  costingService,
  type BudgetVersion,
  type BudgetLine,
  type AllocationRule,
  type AllocRun,
  type AllocResult,
  type CostToServe,
  type CostToServeSummary,
  type DmaLeagueEntry,
  type TrendDataPoint,
  type BudgetSummary,
} from '../services/costing.service';

// ============ Budget Versions ============

export const useBudgetVersions = (
  filters?: { fiscal_year?: number; status?: string },
  options?: Omit<UseQueryOptions<{ data: BudgetVersion[]; meta: { total: number } }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'budgets', filters],
    queryFn: () => costingService.getBudgetVersions(filters),
    ...options,
  });
};

export const useBudgetVersion = (
  id: number | null | undefined,
  includeLines = true,
  options?: Omit<UseQueryOptions<{ data: BudgetVersion }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'budgets', id, { includeLines }],
    queryFn: () => costingService.getBudgetVersion(id!, includeLines),
    enabled: id != null,
    ...options,
  });
};

export const useCreateBudgetVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      fiscal_year: number;
      status?: string;
      is_rolling?: boolean;
      base_version_id?: number;
    }) => costingService.createBudgetVersion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets'] });
    },
  });
};

export const useUpdateBudgetVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        fiscal_year?: number;
        status?: string;
        is_rolling?: boolean;
      };
    }) => costingService.updateBudgetVersion(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets'] });
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets', variables.id] });
    },
  });
};

export const useDeleteBudgetVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costingService.deleteBudgetVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets'] });
    },
  });
};

export const useApproveBudgetVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costingService.approveBudgetVersion(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets'] });
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets', id] });
    },
  });
};

export const useBudgetLines = (
  versionId: number | null,
  filters?: { cost_center_id?: number; gl_account_id?: number; period_from?: string; period_to?: string },
  options?: Omit<UseQueryOptions<{ data: BudgetLine[]; meta: { total: number } }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'budgets', versionId, 'lines', filters],
    queryFn: () => costingService.getBudgetLines(versionId!, filters),
    enabled: versionId != null,
    ...options,
  });
};

export const useUpsertBudgetLines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      versionId,
      lines,
    }: {
      versionId: number;
      lines: Array<{
        cost_center_id: number;
        gl_account_id: number;
        period: string;
        amount: number;
        class?: string;
        scheme_id?: number;
        dma_id?: number;
        project_id?: number;
        meta?: Record<string, any>;
      }>;
    }) => costingService.upsertBudgetLines(versionId, lines),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets', variables.versionId, 'lines'] });
      queryClient.invalidateQueries({ queryKey: ['costing', 'budgets', variables.versionId] });
    },
  });
};

export const useBudgetSummary = (
  versionId: number | null,
  options?: Omit<UseQueryOptions<{ data: BudgetSummary[] }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'budgets', versionId, 'summary'],
    queryFn: () => costingService.getBudgetSummary(versionId!),
    enabled: versionId != null,
    ...options,
  });
};

// ============ Allocation Rules ============

export const useAllocationRules = (
  filters?: { basis?: string; active?: boolean },
  options?: Omit<UseQueryOptions<{ data: AllocationRule[] }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'allocation-rules', filters],
    queryFn: () => costingService.getAllocationRules(filters),
    ...options,
  });
};

export const useCreateAllocationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      basis: 'driver' | 'percentage' | 'equal' | 'formula';
      driver_id?: number;
      percentage?: number;
      formula?: string;
      applies_to: string;
      scope_filter?: Record<string, any>;
    }) => costingService.createAllocationRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'allocation-rules'] });
    },
  });
};

export const useUpdateAllocationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        basis?: 'driver' | 'percentage' | 'equal' | 'formula';
        driver_id?: number;
        percentage?: number;
        formula?: string;
        applies_to?: string;
        active?: boolean;
        scope_filter?: Record<string, any>;
      };
    }) => costingService.updateAllocationRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'allocation-rules'] });
    },
  });
};

export const useDeleteAllocationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costingService.deleteAllocationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'allocation-rules'] });
    },
  });
};

// ============ Allocation Runs ============

export const useAllocationRuns = (
  filters?: { status?: string; period_from?: string },
  options?: Omit<UseQueryOptions<{ data: AllocRun[]; meta: { total: number } }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'allocation-runs', filters],
    queryFn: () => costingService.getAllocationRuns(filters),
    ...options,
  });
};

export const useAllocationRun = (
  id: number | null,
  options?: Omit<UseQueryOptions<{ data: AllocRun }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'allocation-runs', id],
    queryFn: () => costingService.getAllocationRun(id!),
    enabled: id != null,
    ...options,
  });
};

export const useExecuteAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      version_id?: number;
      forecast_id?: number;
      period_from: string;
      period_to: string;
    }) => costingService.executeAllocationRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'allocation-runs'] });
    },
  });
};

export const useDeleteAllocationRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costingService.deleteAllocationRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'allocation-runs'] });
    },
  });
};

// ============ Cost-to-Serve ============

export const useCostToServeMetrics = (
  filters?: { period_from?: string; period_to?: string; scheme_id?: number; dma_id?: number; class?: string },
  options?: Omit<UseQueryOptions<{ data: CostToServe[]; meta: { total: number } }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'cost-to-serve', filters],
    queryFn: () => costingService.getCostToServeMetrics(filters),
    ...options,
  });
};

export const useCalculateCostToServe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      period: string;
      scheme_id?: number;
      dma_id?: number;
      class?: string;
      production_m3: number;
      billed_m3: number;
      revenue?: number;
    }) => costingService.calculateCostToServe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costing', 'cost-to-serve'] });
    },
  });
};

export const useCostToServeSummary = (
  filters?: { period_from?: string; period_to?: string; scheme_id?: number },
  options?: Omit<UseQueryOptions<{ data: CostToServeSummary }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'cost-to-serve', 'summary', filters],
    queryFn: () => costingService.getCostToServeSummary(filters),
    ...options,
  });
};

export const useCostToServeTrends = (
  filters?: { period_from?: string; period_to?: string; scheme_id?: number; dma_id?: number },
  options?: Omit<UseQueryOptions<{ data: TrendDataPoint[] }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'cost-to-serve', 'trends', filters],
    queryFn: () => costingService.getCostToServeTrends(filters),
    ...options,
  });
};

export const useDmaLeague = (
  period: string | null,
  options?: Omit<UseQueryOptions<{ data: DmaLeagueEntry[] }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['costing', 'cost-to-serve', 'dma-league', period],
    queryFn: () => costingService.getDmaLeagueTable(period!),
    enabled: period != null,
    ...options,
  });
};
