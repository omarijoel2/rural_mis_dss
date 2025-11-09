import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { CoreRegistryHome } from './pages/core-registry/CoreRegistryHome';
import { SchemesPage } from './pages/core-registry/SchemesPage';
import { FacilitiesPage } from './pages/core-registry/FacilitiesPage';
import { DmasPage } from './pages/core-registry/DmasPage';
import { PipelinesPage } from './pages/core-registry/PipelinesPage';
import { ZonesPage } from './pages/core-registry/ZonesPage';
import { AddressesPage } from './pages/core-registry/AddressesPage';
import { MapConsolePage } from './pages/gis/MapConsolePage';
import { SecurityLayout } from './components/layouts/SecurityLayout';
import { AuditPage } from './pages/security/AuditPage';
import { SecurityAlertsPage } from './pages/security/SecurityAlertsPage';
import { RolesPage } from './pages/security/RolesPage';
import { ApiKeysPage } from './pages/security/ApiKeysPage';
import { DsrPage } from './pages/security/DsrPage';
import { ConsentsPage } from './pages/security/ConsentsPage';
import { KmsPage } from './pages/security/KmsPage';
import { RetentionPage } from './pages/security/RetentionPage';
import { DataCatalogPage } from './pages/security/DataCatalogPage';
import { TwoFactorSetupPage } from './pages/security/TwoFactorSetupPage';
import { CmmsLayout } from './components/layouts/CmmsLayout';
import { CmmsDashboard } from './pages/cmms/CmmsDashboard';
import { AssetsPage } from './pages/cmms/AssetsPage';
import { AssetDetailPage } from './pages/cmms/AssetDetailPage';
import { WorkOrdersPage } from './pages/cmms/WorkOrdersPage';
import { PartsPage } from './pages/cmms/PartsPage';
import { CmmsMapPage } from './pages/cmms/CmmsMapPage';
import { WaterQualityLayout } from './components/layouts/WaterQualityLayout';
import { ParametersPage } from './pages/water-quality/ParametersPage';
import { SamplingPointsPage } from './pages/water-quality/SamplingPointsPage';
import { PlansPage } from './pages/water-quality/PlansPage';
import { SamplesPage } from './pages/water-quality/SamplesPage';
import { ResultsPage } from './pages/water-quality/ResultsPage';
import { CompliancePage } from './pages/water-quality/CompliancePage';
import NotFound from './pages/not-found';

export function AppMIS() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/core" replace />
                </ProtectedRoute>
              } />
              
              <Route path="/core" element={
                <ProtectedRoute requiredPermission="view schemes">
                  <CoreRegistryHome />
                </ProtectedRoute>
              } />
              
              <Route path="/core/schemes" element={
                <ProtectedRoute requiredPermission="view schemes">
                  <SchemesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/core/facilities" element={
                <ProtectedRoute requiredPermission="view facilities">
                  <FacilitiesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/core/dmas" element={
                <ProtectedRoute requiredPermission="view dmas">
                  <DmasPage />
                </ProtectedRoute>
              } />
              
              <Route path="/core/pipelines" element={
                <ProtectedRoute requiredPermission="view pipelines">
                  <PipelinesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/core/zones" element={
                <ProtectedRoute requiredPermission="view zones">
                  <ZonesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/core/addresses" element={
                <ProtectedRoute requiredPermission="view addresses">
                  <AddressesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/gis/map" element={
                <ProtectedRoute requiredPermission="view schemes">
                  <MapConsolePage />
                </ProtectedRoute>
              } />
              
              <Route path="/cmms" element={
                <ProtectedRoute>
                  <CmmsLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/cmms/dashboard" replace />} />
                <Route path="dashboard" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <CmmsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="assets" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <AssetsPage />
                  </ProtectedRoute>
                } />
                <Route path="assets/:id" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <AssetDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="work-orders" element={
                  <ProtectedRoute requiredPermission="view work orders">
                    <WorkOrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="parts" element={
                  <ProtectedRoute requiredPermission="view parts inventory">
                    <PartsPage />
                  </ProtectedRoute>
                } />
                <Route path="map" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <CmmsMapPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/security" element={
                <ProtectedRoute>
                  <SecurityLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/security/audit" replace />} />
                <Route path="audit" element={
                  <ProtectedRoute requiredPermission="view audit">
                    <AuditPage />
                  </ProtectedRoute>
                } />
                <Route path="alerts" element={
                  <ProtectedRoute requiredPermission="view security alerts">
                    <SecurityAlertsPage />
                  </ProtectedRoute>
                } />
                <Route path="roles" element={
                  <ProtectedRoute requiredPermission="view roles">
                    <RolesPage />
                  </ProtectedRoute>
                } />
                <Route path="api-keys" element={
                  <ProtectedRoute requiredPermission="view api keys">
                    <ApiKeysPage />
                  </ProtectedRoute>
                } />
                <Route path="dsr" element={
                  <ProtectedRoute requiredPermission="view dsr requests">
                    <DsrPage />
                  </ProtectedRoute>
                } />
                <Route path="consents" element={
                  <ProtectedRoute requiredPermission="view consents">
                    <ConsentsPage />
                  </ProtectedRoute>
                } />
                <Route path="kms" element={
                  <ProtectedRoute requiredPermission="view kms keys">
                    <KmsPage />
                  </ProtectedRoute>
                } />
                <Route path="retention" element={
                  <ProtectedRoute requiredPermission="manage retention policies">
                    <RetentionPage />
                  </ProtectedRoute>
                } />
                <Route path="data-catalog" element={
                  <ProtectedRoute requiredPermission="view data catalog">
                    <DataCatalogPage />
                  </ProtectedRoute>
                } />
                <Route path="2fa" element={
                  <ProtectedRoute>
                    <TwoFactorSetupPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/water-quality" element={
                <ProtectedRoute>
                  <WaterQualityLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/water-quality/parameters" replace />} />
                <Route path="parameters" element={
                  <ProtectedRoute requiredPermission="view water quality parameters">
                    <ParametersPage />
                  </ProtectedRoute>
                } />
                <Route path="sampling-points" element={
                  <ProtectedRoute requiredPermission="view water quality sampling points">
                    <SamplingPointsPage />
                  </ProtectedRoute>
                } />
                <Route path="plans" element={
                  <ProtectedRoute requiredPermission="view water quality plans">
                    <PlansPage />
                  </ProtectedRoute>
                } />
                <Route path="samples" element={
                  <ProtectedRoute requiredPermission="view water quality samples">
                    <SamplesPage />
                  </ProtectedRoute>
                } />
                <Route path="results" element={
                  <ProtectedRoute requiredPermission="view water quality results">
                    <ResultsPage />
                  </ProtectedRoute>
                } />
                <Route path="compliance" element={
                  <ProtectedRoute requiredPermission="view water quality compliance">
                    <CompliancePage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
