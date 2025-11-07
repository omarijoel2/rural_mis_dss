import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { CoreRegistryHome } from './pages/core-registry/CoreRegistryHome';
import { SchemesPage } from './pages/core-registry/SchemesPage';
import { FacilitiesPage } from './pages/core-registry/FacilitiesPage';
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
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
