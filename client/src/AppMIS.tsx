import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { CoreRegistryHome } from './pages/core-registry/CoreRegistryHome';
import { SchemesPage } from './pages/core-registry/SchemesPage';
import { FacilitiesPage } from './pages/core-registry/FacilitiesPage';
import NotFound from './pages/not-found';

export function AppMIS() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Navigate to="/core" replace />} />
            <Route path="/core" element={<CoreRegistryHome />} />
            <Route path="/core/schemes" element={<SchemesPage />} />
            <Route path="/core/facilities" element={<FacilitiesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
