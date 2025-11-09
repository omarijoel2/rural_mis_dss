import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ParametersPage } from '../pages/water-quality/ParametersPage';
import { SamplingPointsPage } from '../pages/water-quality/SamplingPointsPage';
import { PlansPage } from '../pages/water-quality/PlansPage';
import { SamplesPage } from '../pages/water-quality/SamplesPage';
import { ResultsPage } from '../pages/water-quality/ResultsPage';
import * as apiClient from '../lib/api-client';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      tenant_id: 1,
      roles: ['QA/QC Officer'],
      permissions: [
        'view wq parameters',
        'create wq parameters',
        'edit wq parameters',
        'delete wq parameters',
        'view wq sampling points',
        'create wq sampling points',
        'view wq plans',
        'create wq plans',
        'view wq samples',
        'view wq results',
        'import wq results',
      ],
    },
    hasPermission: (perm: string) => true,
    hasAnyPermission: () => true,
    hasRole: () => true,
    logout: vi.fn(),
    login: vi.fn(),
    loading: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Water Quality Integration Tests', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('Parameters Page', () => {
    it('should render parameters page with header', async () => {
      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: [],
        meta: { total: 0, from: 0, to: 0, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<ParametersPage />);

      await waitFor(() => {
        expect(screen.getByText(/Water Quality Parameters/i)).toBeInTheDocument();
      });
    });

    it('should load and display parameters', async () => {
      const mockParameters = [
        {
          id: 1,
          code: 'PH',
          name: 'pH',
          category: 'physical',
          unit: 'pH units',
          who_limit: 8.5,
          wasreb_limit: 8.5,
          lod: 0.1,
        },
      ];

      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: mockParameters,
        meta: { total: 1, from: 1, to: 1, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<ParametersPage />);

      await waitFor(() => {
        expect(screen.getByText('pH')).toBeInTheDocument();
        expect(screen.getByText('PH')).toBeInTheDocument();
        expect(screen.getByText('pH units')).toBeInTheDocument();
      });
    });

    it('should display add parameter button', async () => {
      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: [],
        meta: { total: 0, from: 0, to: 0, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<ParametersPage />);

      await waitFor(() => {
        expect(screen.getByText(/Add Parameter/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sampling Points Page', () => {
    it('should render sampling points page with map toggle', async () => {
      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: [],
        meta: { total: 0, from: 0, to: 0, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<SamplingPointsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Sampling Points/i)).toBeInTheDocument();
        expect(screen.getByText(/Show Map/i)).toBeInTheDocument();
      });
    });

    it('should load and display sampling points with GPS coordinates', async () => {
      const mockPoints = [
        {
          id: 1,
          code: 'BH-001',
          name: 'Borehole #1',
          kind: 'source',
          location: {
            type: 'Point',
            coordinates: [36.8219, -1.2921],
          },
          elevation_m: 1680,
          is_active: true,
        },
      ];

      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: mockPoints,
        meta: { total: 1, from: 1, to: 1, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<SamplingPointsPage />);

      await waitFor(() => {
        expect(screen.getByText('Borehole #1')).toBeInTheDocument();
        expect(screen.getByText(/BH-001/)).toBeInTheDocument();
        expect(screen.getByText(/source/i)).toBeInTheDocument();
      });
    });
  });

  describe('Plans Page', () => {
    it('should render plans page and activate plan', async () => {
      const mockPlans = [
        {
          id: 1,
          name: 'Q1 2024 Monitoring',
          frequency: 'quarterly',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          is_active: false,
          rules_count: 5,
        },
      ];

      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: mockPlans,
        meta: { total: 1, from: 1, to: 1, current_page: 1, last_page: 1 },
      });

      vi.mocked(apiClient.apiClient.post).mockResolvedValue({ success: true });

      renderWithProviders(<PlansPage />);

      await waitFor(() => {
        expect(screen.getByText('Q1 2024 Monitoring')).toBeInTheDocument();
      });

      const activateButton = screen.getByText(/Activate/i);
      fireEvent.click(activateButton);

      await waitFor(() => {
        expect(apiClient.apiClient.post).toHaveBeenCalledWith(
          '/v1/water-quality/plans/1/activate',
          {}
        );
      });
    });

    it('should generate samples from plan', async () => {
      const mockPlans = [
        {
          id: 1,
          name: 'Q1 2024 Monitoring',
          frequency: 'quarterly',
          start_date: '2024-01-01',
          is_active: true,
          rules_count: 5,
        },
      ];

      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: mockPlans,
        meta: { total: 1, from: 1, to: 1, current_page: 1, last_page: 1 },
      });

      vi.mocked(apiClient.apiClient.post).mockResolvedValue({ generated: 15 });

      renderWithProviders(<PlansPage />);

      await waitFor(() => {
        expect(screen.getByText(/Generate Samples/i)).toBeInTheDocument();
      });

      const generateButton = screen.getByText(/Generate Samples/i);
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(apiClient.apiClient.post).toHaveBeenCalledWith(
          '/v1/water-quality/plans/1/generate-samples',
          {}
        );
      });
    });
  });

  describe('Samples Page', () => {
    it('should display samples with custody state tracking', async () => {
      const mockSamples = [
        {
          id: 1,
          barcode: 'WQ20240101-ABC123',
          custody_state: 'collected',
          scheduled_at: '2024-01-01T08:00:00Z',
          collected_at: '2024-01-01T08:30:00Z',
          collected_by: 'John Doe',
          parameters_count: 5,
          custody_chain: [
            { event: 'collected', timestamp: '2024-01-01T08:30:00Z' },
          ],
        },
      ];

      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: mockSamples,
        meta: { total: 1, from: 1, to: 1, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<SamplesPage />);

      await waitFor(() => {
        expect(screen.getByText('WQ20240101-ABC123')).toBeInTheDocument();
        expect(screen.getByText(/collected/i)).toBeInTheDocument();
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });
    });

    it('should show receive in lab button for collected samples', async () => {
      const mockSamples = [
        {
          id: 1,
          barcode: 'WQ20240101-ABC123',
          custody_state: 'collected',
          scheduled_at: '2024-01-01T08:00:00Z',
          collected_at: '2024-01-01T08:30:00Z',
          collected_by: 'John Doe',
          parameters_count: 5,
        },
      ];

      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: mockSamples,
        meta: { total: 1, from: 1, to: 1, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<SamplesPage />);

      await waitFor(() => {
        expect(screen.getByText(/Receive in Lab/i)).toBeInTheDocument();
      });
    });
  });

  describe('Results Page', () => {
    it('should display lab results with QC flags', async () => {
      const mockResults = [
        {
          id: 1,
          sample_param: {
            parameter: { name: 'E.coli' },
            sample: { barcode: 'WQ20240101-ABC123' },
          },
          value: 10,
          uncertainty: 2,
          qc_flags: ['exceeds_wasreb_limit'],
          method: 'SM 9223-B',
          analyst: 'Jane Smith',
          analyzed_at: '2024-01-15T10:00:00Z',
        },
      ];

      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: mockResults,
        meta: { total: 1, from: 1, to: 1, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('E.coli')).toBeInTheDocument();
        expect(screen.getByText(/WQ20240101-ABC123/)).toBeInTheDocument();
        expect(screen.getByText(/10.*±.*2/)).toBeInTheDocument();
      });
    });

    it('should display CSV import button', async () => {
      vi.mocked(apiClient.apiClient.get).mockResolvedValue({
        data: [],
        meta: { total: 0, from: 0, to: 0, current_page: 1, last_page: 1 },
      });

      renderWithProviders(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Import CSV/i)).toBeInTheDocument();
      });
    });
  });
});
