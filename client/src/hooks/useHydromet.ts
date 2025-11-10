import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  hydrometService,
  type Source,
  type HydrometStation,
  type HydrometSensor,
  type AbstractionLog,
  type SourceFilters,
  type StationFilters,
  type CreateSourceData,
  type CreateStationData,
  type CreateSensorData,
  type LogAbstractionData,
  type SpatialQuery,
  type BoundsQuery,
} from '../services/hydromet.service';

export const useHydrometSources = (
  filters?: SourceFilters,
  options?: Omit<UseQueryOptions<{ data: Source[] }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'sources', filters],
    queryFn: () => hydrometService.getSources(filters),
    ...options,
  });
};

export const useHydrometSource = (
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<Source>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'sources', id],
    queryFn: () => hydrometService.getSource(id!),
    enabled: id != null,
    ...options,
  });
};

export const useHydrometSourcesNearby = (
  query: SpatialQuery | null,
  options?: Omit<UseQueryOptions<Source[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'sources', 'nearby', query],
    queryFn: () => hydrometService.getSourcesNearby(query!),
    enabled: query != null,
    ...options,
  });
};

export const useHydrometSourcesInBounds = (
  query: BoundsQuery | null,
  options?: Omit<UseQueryOptions<Source[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'sources', 'in-bounds', query],
    queryFn: () => hydrometService.getSourcesInBounds(query!),
    enabled: query != null,
    ...options,
  });
};

export const useAbstractionHistory = (
  sourceId: number | null,
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions<AbstractionLog[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'sources', sourceId, 'abstraction', 'history', startDate, endDate],
    queryFn: () => hydrometService.getAbstractionHistory(sourceId!, startDate, endDate),
    enabled: sourceId != null,
    ...options,
  });
};

export const useTotalAbstraction = (
  sourceId: number | null,
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions<{ total_m3: number }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'sources', sourceId, 'abstraction', 'total', startDate, endDate],
    queryFn: () => hydrometService.getTotalAbstraction(sourceId!, startDate, endDate),
    enabled: sourceId != null,
    ...options,
  });
};

export const useCreateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSourceData) => hydrometService.createSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'sources'] });
    },
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSourceData> }) =>
      hydrometService.updateSource(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'sources'] });
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'sources', variables.id] });
    },
  });
};

export const useDeleteSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hydrometService.deleteSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'sources'] });
    },
  });
};

export const useLogAbstraction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, data }: { sourceId: number; data: LogAbstractionData }) =>
      hydrometService.logAbstraction(sourceId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'sources', variables.sourceId, 'abstraction'] });
    },
  });
};

export const useHydrometStations = (
  filters?: StationFilters,
  options?: Omit<UseQueryOptions<{ data: HydrometStation[] }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'stations', filters],
    queryFn: () => hydrometService.getStations(filters),
    ...options,
  });
};

export const useHydrometStation = (
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<HydrometStation>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'stations', id],
    queryFn: () => hydrometService.getStation(id!),
    enabled: id != null,
    ...options,
  });
};

export const useHydrometStationsNearby = (
  query: SpatialQuery | null,
  options?: Omit<UseQueryOptions<HydrometStation[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'stations', 'nearby', query],
    queryFn: () => hydrometService.getStationsNearby(query!),
    enabled: query != null,
    ...options,
  });
};

export const useHydrometStationsInBounds = (
  query: BoundsQuery | null,
  options?: Omit<UseQueryOptions<HydrometStation[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'stations', 'in-bounds', query],
    queryFn: () => hydrometService.getStationsInBounds(query!),
    enabled: query != null,
    ...options,
  });
};

export const useCreateStation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStationData) => hydrometService.createStation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations'] });
    },
  });
};

export const useUpdateStation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateStationData> }) =>
      hydrometService.updateStation(id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations'] });
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', variables.id] });
    },
  });
};

export const useDeleteStation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hydrometService.deleteStation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations'] });
    },
  });
};

export const useActivateStation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hydrometService.activateStation(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations'] });
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', id] });
    },
  });
};

export const useDeactivateStation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hydrometService.deactivateStation(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations'] });
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', id] });
    },
  });
};

export const useStationSensors = (
  stationId: number | null,
  activeOnly?: boolean,
  options?: Omit<UseQueryOptions<HydrometSensor[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['hydromet', 'stations', stationId, 'sensors', activeOnly],
    queryFn: () => hydrometService.getSensors(stationId!, activeOnly),
    enabled: stationId != null,
    ...options,
  });
};

export const useCreateSensor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stationId, data }: { stationId: number; data: CreateSensorData }) =>
      hydrometService.createSensor(stationId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', variables.stationId, 'sensors'] });
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', variables.stationId] });
    },
  });
};

export const useUpdateSensor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stationId, sensorId, data }: { stationId: number; sensorId: number; data: Partial<CreateSensorData> }) =>
      hydrometService.updateSensor(stationId, sensorId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', variables.stationId, 'sensors'] });
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', variables.stationId] });
    },
  });
};

export const useDeleteSensor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stationId, sensorId }: { stationId: number; sensorId: number }) =>
      hydrometService.deleteSensor(stationId, sensorId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', variables.stationId, 'sensors'] });
      queryClient.invalidateQueries({ queryKey: ['hydromet', 'stations', variables.stationId] });
    },
  });
};
