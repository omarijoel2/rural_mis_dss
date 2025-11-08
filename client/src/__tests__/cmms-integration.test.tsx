import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AssetsPage } from '../pages/cmms/AssetsPage';
import { WorkOrdersPage } from '../pages/cmms/WorkOrdersPage';
import { PartsPage } from '../pages/cmms/PartsPage';
import { CmmsLayout } from '../components/layouts/CmmsLayout';
import * as assetService from '../services/asset.service';
import * as workOrderService from '../services/workOrder.service';
import * as partService from '../services/part.service';

vi.mock('../services/asset.service');
vi.mock('../services/workOrder.service');
vi.mock('../services/part.service');

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      tenant_id: 1,
      roles: ['Manager'],
      permissions: [
        'view assets',
        'create assets',
        'edit assets',
        'view work orders',
        'create work orders',
        'view parts inventory',
        'create parts inventory',
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

describe('CMMS Integration Tests', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('Assets Page', () => {
    it('should render assets page with header', async () => {
      vi.mocked(assetService.assetService.getAssets).mockResolvedValue({
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });

      vi.mocked(assetService.assetService.getClasses).mockResolvedValue([]);

      renderWithProviders(<AssetsPage />);

      await waitFor(() => {
        expect(screen.getByText(/assets/i)).toBeInTheDocument();
      });
    });

    it('should display add asset button', async () => {
      vi.mocked(assetService.assetService.getAssets).mockResolvedValue({
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });

      vi.mocked(assetService.assetService.getClasses).mockResolvedValue([]);

      renderWithProviders(<AssetsPage />);

      await waitFor(() => {
        expect(screen.getByText(/add asset/i)).toBeInTheDocument();
      });
    });

    it('should load and display assets', async () => {
      const mockAssets = [
        {
          id: 1,
          code: 'AST-001',
          name: 'Test Asset',
          status: 'active' as const,
          class_id: 1,
          asset_class: { id: 1, name: 'Test Class', code: 'TC' },
        },
      ];

      vi.mocked(assetService.assetService.getAssets).mockResolvedValue({
        data: mockAssets,
        total: 1,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
      });

      vi.mocked(assetService.assetService.getClasses).mockResolvedValue([]);

      renderWithProviders(<AssetsPage />);

      await waitFor(() => {
        expect(screen.getByText('AST-001')).toBeInTheDocument();
        expect(screen.getByText('Test Asset')).toBeInTheDocument();
      });
    });
  });

  describe('Work Orders Page', () => {
    it('should render work orders page with header', async () => {
      vi.mocked(workOrderService.workOrderService.getWorkOrders).mockResolvedValue({
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });

      renderWithProviders(<WorkOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText(/work orders/i)).toBeInTheDocument();
      });
    });

    it('should display create work order button', async () => {
      vi.mocked(workOrderService.workOrderService.getWorkOrders).mockResolvedValue({
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });

      renderWithProviders(<WorkOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText(/create work order/i)).toBeInTheDocument();
      });
    });

    it('should load and display work orders', async () => {
      const mockWorkOrders = [
        {
          id: 1,
          wo_num: 'WO-001',
          title: 'Test Work Order',
          status: 'open' as const,
          kind: 'cm' as const,
          priority: 'medium' as const,
        },
      ];

      vi.mocked(workOrderService.workOrderService.getWorkOrders).mockResolvedValue({
        data: mockWorkOrders,
        total: 1,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
      });

      renderWithProviders(<WorkOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText('WO-001')).toBeInTheDocument();
        expect(screen.getByText('Test Work Order')).toBeInTheDocument();
      });
    });
  });

  describe('Parts Page', () => {
    it('should render parts page with header', async () => {
      vi.mocked(partService.partService.getParts).mockResolvedValue({
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });

      renderWithProviders(<PartsPage />);

      await waitFor(() => {
        expect(screen.getByText(/parts inventory/i)).toBeInTheDocument();
      });
    });

    it('should display add part button', async () => {
      vi.mocked(partService.partService.getParts).mockResolvedValue({
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });

      renderWithProviders(<PartsPage />);

      await waitFor(() => {
        expect(screen.getByText(/add part/i)).toBeInTheDocument();
      });
    });

    it('should load and display parts', async () => {
      const mockParts = [
        {
          id: 1,
          code: 'PRT-001',
          name: 'Test Part',
          category: 'electrical',
          unit: 'pcs',
          stock_balance: 10,
          reorder_level: 5,
        },
      ];

      vi.mocked(partService.partService.getParts).mockResolvedValue({
        data: mockParts,
        total: 1,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
      });

      renderWithProviders(<PartsPage />);

      await waitFor(() => {
        expect(screen.getByText('PRT-001')).toBeInTheDocument();
        expect(screen.getByText('Test Part')).toBeInTheDocument();
      });
    });
  });

  describe('CMMS Layout Navigation', () => {
    it('should display navigation sidebar', () => {
      renderWithProviders(<CmmsLayout />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('Work Orders')).toBeInTheDocument();
      expect(screen.getByText('Parts Inventory')).toBeInTheDocument();
      expect(screen.getByText('Asset Map')).toBeInTheDocument();
    });

    it('should display user information', () => {
      renderWithProviders(<CmmsLayout />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('RBAC and Permissions', () => {
    it('should show create buttons for users with create permissions', async () => {
      vi.mocked(assetService.assetService.getAssets).mockResolvedValue({
        data: [],
        total: 0,
        per_page: 15,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
      });

      vi.mocked(assetService.assetService.getClasses).mockResolvedValue([]);

      renderWithProviders(<AssetsPage />);

      await waitFor(() => {
        expect(screen.getByText(/add asset/i)).toBeInTheDocument();
      });
    });
  });
});
