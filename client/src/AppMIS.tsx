import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { SignupPage } from './pages/auth/SignupPage';
import { CoreRegistryHome } from './pages/core-registry/CoreRegistryHome';
import { SchemesPage } from './pages/core-registry/SchemesPage';
import { SchemesExplorerPage } from './pages/core-registry/SchemesExplorerPage';
import { FacilitiesPage } from './pages/core-registry/FacilitiesPage';
import { MeterRegistryPage } from './pages/core-registry/MeterRegistryPage';
import { DmasPage } from './pages/core-registry/DmasPage';
import { PipelinesPage } from './pages/core-registry/PipelinesPage';
import { ZonesPage } from './pages/core-registry/ZonesPage';
import { AddressesPage } from './pages/core-registry/AddressesPage';
import { MapConsolePage } from './pages/gis/MapConsolePage';
import { GISPage } from './pages/gis/index';
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
import { 
  CmmsDashboard, 
  AssetsPage,
  AssetClassesPage,
  AssetDetailPage, 
  WorkOrdersPage, 
  PartsPage, 
  CmmsMapPage,
  JobPlansPage,
  PmPage,
  ConditionMonitoringPage,
  StoresPage,
  FleetPage,
  ContractorsPage,
  HsePage
} from './pages/cmms';
import { WaterQualityLayout } from './components/layouts/WaterQualityLayout';
import { ParametersPage } from './pages/water-quality/ParametersPage';
import { SamplingPointsPage } from './pages/water-quality/SamplingPointsPage';
import { PlansPage } from './pages/water-quality/PlansPage';
import { SamplesPage } from './pages/water-quality/SamplesPage';
import { ResultsPage } from './pages/water-quality/ResultsPage';
import { CompliancePage } from './pages/water-quality/CompliancePage';
import { CrmLayout } from './components/layouts/CrmLayout';
import { CustomersPage, Account360Page, AccountSearchPage, ComplaintsPage, InteractionsPage, SegmentationPage, RaConsolePage, DunningPage, ImportCenterPage } from './pages/crm';
import { SourcesPage } from './pages/hydromet/SourcesPage';
import { StationsPage } from './pages/hydromet/StationsPage';
import { CostingLayout } from './components/layouts/CostingLayout';
import { BudgetListPage, BudgetDetailPage, AllocationConsolePage, CostToServeDashboard, GlAccountsPage, CostCentersPage } from './pages/costing';
import { EnergyTariffSetup } from './pages/costing/EnergyTariffSetup';
import { EnergyReadingsUpload } from './pages/costing/EnergyReadingsUpload';
import { EnergyCostDashboard } from './pages/costing/EnergyCostDashboard';
import { RequisitionsPage } from './pages/procurement/RequisitionsPage';
import { RFQBuilderPage } from './pages/procurement/RFQBuilderPage';
import { LPOManagementPage } from './pages/procurement/LPOManagementPage';
import { CoreRegistryLayout } from './components/layouts/CoreRegistryLayout';
import { HydrometLayout } from './components/layouts/HydrometLayout';
import { ProjectsLayout } from './components/layouts/ProjectsLayout';
import { ProjectsHome } from './pages/projects/ProjectsHome';
import { ProjectsList } from './pages/projects/ProjectsList';
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage';
import { InvestmentPipelinesPage } from './pages/projects/InvestmentPipelinesPage';
import { LandPage } from './pages/projects/LandPage';
import { ModelLibraryPage } from './pages/projects/ModelLibraryPage';
import { HandoverPage } from './pages/projects/HandoverPage';
import { ProcurementPage } from './pages/projects/ProcurementPage';
import { ProjectsMapPage } from './pages/projects/ProjectsMapPage';
import { AdminLayout } from './components/layouts/AdminLayout';
import { IntegrationLayout } from './components/layouts/IntegrationLayout';
import { MELayout } from './components/layouts/MELayout';
import { CustomerLayout } from './components/layouts/CustomerLayout';
import { UsersManagement } from './pages/admin/UsersManagement';
import { RolesPermissions } from './pages/admin/rbac/RolesPermissions';
import { PermissionMatrix } from './pages/admin/rbac/PermissionMatrix';
import { AuditLogs } from './pages/admin/AuditLogs';
import { ApiCatalogPage } from './pages/integration/ApiCatalogPage';
import { MdmEntityHubsPage } from './pages/integration/MdmEntityHubsPage';
import { SsoConfigPage } from './pages/integration/SsoConfigPage';
import { EdRmsPage } from './pages/integration/EdRmsPage';
import { DataWarehousePage } from './pages/integration/DataWarehousePage';
import { NotificationsPage } from './pages/integration/NotificationsPage';
import { DeviceRegistryPage } from './pages/integration/DeviceRegistryPage';
import { ObservabilityPage } from './pages/integration/ObservabilityPage';
import { BackupDrPage } from './pages/integration/BackupDrPage';
import { SecretsVaultPage } from './pages/integration/SecretsVaultPage';
import { APICatalog } from './pages/integration/APICatalog';
import { ConnectorGallery } from './pages/integration/ConnectorGallery';
import { WebhookManager } from './pages/integration/WebhookManager';
import { ETLJobs } from './pages/integration/ETLJobs';
import { DataWarehouse } from './pages/integration/DataWarehouse';
import { CommunicationTemplates } from './pages/integration/CommunicationTemplates';
import { KPIDashboard } from './pages/me/KPIDashboard';
import { CoverageAnalytics } from './pages/me/CoverageAnalytics';
import { NRWTracker } from './pages/me/NRWTracker';
import { CXAnalytics } from './pages/me/CXAnalytics';
import { ResultsFramework } from './pages/me/ResultsFramework';
import { Tariffs } from './pages/customer/Tariffs';
import { BillingRuns } from './pages/customer/BillingRuns';
import { PaymentReconciliation } from './pages/customer/PaymentReconciliation';
import { MeterRoutes } from './pages/customer/MeterRoutes';
import { Tickets } from './pages/customer/Tickets';
import { Kiosks } from './pages/customer/Kiosks';
import { WaterTrucking } from './pages/customer/WaterTrucking';
import { Connections } from './pages/customer/Connections';
import { CommunityLayout } from './components/layouts/CommunityLayout';
import { CommitteesDirectory } from './pages/community/CommitteesDirectory';
import { CommitteeProfile } from './pages/community/CommitteeProfile';
import { CommitteeFinance } from './pages/community/CommitteeFinance';
import { VendorPortal } from './pages/community/VendorPortal';
import { BidsCenter } from './pages/community/BidsCenter';
import { VendorDeliveries } from './pages/community/VendorDeliveries';
import { StakeholderMap } from './pages/community/StakeholderMap';
import { EngagementPlanner } from './pages/community/EngagementPlanner';
import { GRMConsole } from './pages/community/GRMConsole';
import { OpenDataCatalog } from './pages/community/OpenDataCatalog';
import { DatasetBuilder } from './pages/community/DatasetBuilder';
import { PublicMaps } from './pages/community/PublicMaps';
import { CoreOpsLayout } from './components/layouts/CoreOpsLayout';
import { OperationsConsole } from './pages/core-ops/OperationsConsole';
import { TopologyViewer } from './pages/core-ops/TopologyViewer';
import { TelemetryDashboard } from './pages/core-ops/TelemetryDashboard';
import { OutagePlanner } from './pages/core-ops/OutagePlanner';
import { NRWDashboard } from './pages/core-ops/NRWDashboard';
import { DosingControl } from './pages/core-ops/DosingControl';
import { PumpScheduling } from './pages/core-ops/PumpScheduling';
import { PressureLeakPage } from './pages/core-ops/PressureLeakPage';
import { ShiftsPage } from './pages/core-ops/ShiftsPage';
import { EventsPage } from './pages/core-ops/EventsPage';
import { ChecklistsPage } from './pages/core-ops/ChecklistsPage';
import { PlaybooksPage } from './pages/core-ops/PlaybooksPage';
import { EscalationPoliciesPage } from './pages/core-ops/EscalationPoliciesPage';
import { PredictionsDashboard } from './pages/core-ops/PredictionsDashboard';
import { WorkflowDefinitionsPage } from './pages/workflows/WorkflowDefinitionsPage';
import { WorkflowInstancesPage } from './pages/workflows/WorkflowInstancesPage';
import { CapacityAssessmentPage } from './pages/training/CapacityAssessmentPage';
import { AquiferManagementPage } from './pages/hydromet/AquiferManagementPage';
import { DroughtResponsePage } from './pages/core-ops/DroughtResponsePage';
import { GenderEquityReportingPage } from './pages/me/GenderEquityReportingPage';
import { TrainingLayout } from './components/layouts/TrainingLayout';
import { CourseCatalog, MyLearning, KnowledgeBase, SopsPage, SkillsMatrix, CertificatesPage } from './pages/training';
import { DSALayout } from './components/layouts/DSALayout';
import ForecastStudioPage from './pages/dsa/ForecastStudioPage';
import ScenarioWorkbenchPage from './pages/dsa/ScenarioWorkbenchPage';
import OptimizationConsolePage from './pages/dsa/OptimizationConsolePage';
import AnomaliesInboxPage from './pages/dsa/AnomaliesInboxPage';
import AquiferDashboardPage from './pages/dsa/AquiferDashboardPage';
import TariffSandboxPage from './pages/dsa/TariffSandboxPage';
import EWSConsolePage from './pages/dsa/EWSConsolePage';
import { SchemesPageEnhanced } from './pages/core-registry/SchemesPageEnhanced';
import { AssetsPageWithForm } from './pages/core-registry/AssetsPageWithForm';
import { TelemetryPageWithForms } from './pages/core-ops/operations/TelemetryPageWithForms';
import { OutagePlannerWithForm } from './pages/core-ops/operations/OutagePlannerWithForm';
import { NetworkMapPage } from './pages/core-ops/operations/NetworkMapPage';
import { RiskComplianceLayout } from './components/layouts/RiskComplianceLayout';
import { RiskComplianceHome } from './pages/risk-compliance/RiskComplianceHome';
import { RiskRegisterPage } from './pages/risk-compliance/RiskRegisterPage';
import { IncidentsPage } from './pages/risk-compliance/IncidentsPage';
import { BCPPage } from './pages/risk-compliance/BCPPage';
import { RegulatoryReportingPage } from './pages/risk-compliance/RegulatoryReportingPage';
import { PoliciesPage } from './pages/risk-compliance/PoliciesPage';
import { InternalAuditPage } from './pages/risk-compliance/AuditPage';
import { HSEPage } from './pages/risk-compliance/HSEPage';
import { DPOPage } from './pages/risk-compliance/DPOPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { RoleMenuAccessPage } from './pages/admin/RoleMenuAccessPage';
import NotFound from './pages/not-found';

export function AppMIS() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/register" element={<SignupPage />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/costing/budgets" replace />
                </ProtectedRoute>
              } />
              
              <Route path="/core" element={
                <ProtectedRoute>
                  <CoreRegistryLayout />
                </ProtectedRoute>
              }>
                <Route index element={<CoreRegistryHome />} />
                <Route path="schemes" element={
                  <ProtectedRoute requiredPermission="view schemes">
                    <SchemesPageEnhanced />
                  </ProtectedRoute>
                } />
                <Route path="assets" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <AssetsPageWithForm />
                  </ProtectedRoute>
                } />
                <Route path="facilities" element={
                  <ProtectedRoute requiredPermission="view facilities">
                    <FacilitiesPage />
                  </ProtectedRoute>
                } />
                <Route path="dmas" element={
                  <ProtectedRoute requiredPermission="view dmas">
                    <DmasPage />
                  </ProtectedRoute>
                } />
                <Route path="pipelines" element={
                  <ProtectedRoute requiredPermission="view pipelines">
                    <PipelinesPage />
                  </ProtectedRoute>
                } />
                <Route path="zones" element={
                  <ProtectedRoute requiredPermission="view zones">
                    <ZonesPage />
                  </ProtectedRoute>
                } />
                <Route path="addresses" element={
                  <ProtectedRoute requiredPermission="view addresses">
                    <AddressesPage />
                  </ProtectedRoute>
                } />
                <Route path="meters" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <MeterRegistryPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/gis" element={
                <ProtectedRoute requiredPermission="view gis">
                  <GISPage />
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
                <Route path="asset-classes" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <AssetClassesPage />
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
                <Route path="job-plans" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <JobPlansPage />
                  </ProtectedRoute>
                } />
                <Route path="pm" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <PmPage />
                  </ProtectedRoute>
                } />
                <Route path="condition-monitoring" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <ConditionMonitoringPage />
                  </ProtectedRoute>
                } />
                <Route path="stores" element={
                  <ProtectedRoute requiredPermission="view parts inventory">
                    <StoresPage />
                  </ProtectedRoute>
                } />
                <Route path="fleet" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <FleetPage />
                  </ProtectedRoute>
                } />
                <Route path="contractors" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <ContractorsPage />
                  </ProtectedRoute>
                } />
                <Route path="hse" element={
                  <ProtectedRoute requiredPermission="view assets">
                    <HsePage />
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
                  <ProtectedRoute requiredPermission="view wq parameters">
                    <ParametersPage />
                  </ProtectedRoute>
                } />
                <Route path="sampling-points" element={
                  <ProtectedRoute requiredPermission="view wq sampling points">
                    <SamplingPointsPage />
                  </ProtectedRoute>
                } />
                <Route path="plans" element={
                  <ProtectedRoute requiredPermission="view wq plans">
                    <PlansPage />
                  </ProtectedRoute>
                } />
                <Route path="samples" element={
                  <ProtectedRoute requiredPermission="view wq samples">
                    <SamplesPage />
                  </ProtectedRoute>
                } />
                <Route path="results" element={
                  <ProtectedRoute requiredPermission="view wq results">
                    <ResultsPage />
                  </ProtectedRoute>
                } />
                <Route path="compliance" element={
                  <ProtectedRoute requiredPermission="view wq compliance">
                    <CompliancePage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/projects" element={
                <ProtectedRoute>
                  <ProjectsLayout />
                </ProtectedRoute>
              }>
                <Route index element={
                  <ProtectedRoute requiredPermission="view projects">
                    <ProjectsHome />
                  </ProtectedRoute>
                } />
                <Route path="list" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <ProjectsList />
                  </ProtectedRoute>
                } />
                <Route path=":id" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <ProjectDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="pipelines" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <InvestmentPipelinesPage />
                  </ProtectedRoute>
                } />
                <Route path="land" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <LandPage />
                  </ProtectedRoute>
                } />
                <Route path="models" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <ModelLibraryPage />
                  </ProtectedRoute>
                } />
                <Route path="handover" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <HandoverPage />
                  </ProtectedRoute>
                } />
                <Route path="procurement" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <ProcurementPage />
                  </ProtectedRoute>
                } />
                <Route path="map" element={
                  <ProtectedRoute requiredPermission="view projects">
                    <ProjectsMapPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/crm" element={
                <ProtectedRoute>
                  <CrmLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/crm/customers" replace />} />
                <Route path="customers" element={
                  <ProtectedRoute requiredPermission="view customers">
                    <CustomersPage />
                  </ProtectedRoute>
                } />
                <Route path="complaints" element={
                  <ProtectedRoute requiredPermission="view customers">
                    <ComplaintsPage />
                  </ProtectedRoute>
                } />
                <Route path="interactions" element={
                  <ProtectedRoute requiredPermission="view customers">
                    <InteractionsPage />
                  </ProtectedRoute>
                } />
                <Route path="segmentation" element={
                  <ProtectedRoute requiredPermission="view customers">
                    <SegmentationPage />
                  </ProtectedRoute>
                } />
                <Route path="accounts/search" element={
                  <ProtectedRoute requiredPermission="view service connections">
                    <AccountSearchPage />
                  </ProtectedRoute>
                } />
                <Route path="accounts/:accountNo" element={
                  <ProtectedRoute requiredPermission="view service connections">
                    <Account360Page />
                  </ProtectedRoute>
                } />
                <Route path="ra" element={
                  <ProtectedRoute requiredPermission="view ra cases">
                    <RaConsolePage />
                  </ProtectedRoute>
                } />
                <Route path="dunning" element={
                  <ProtectedRoute requiredPermission="view service connections">
                    <DunningPage />
                  </ProtectedRoute>
                } />
                <Route path="import" element={
                  <ProtectedRoute requiredPermission="manage billing">
                    <ImportCenterPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/hydromet" element={
                <ProtectedRoute>
                  <HydrometLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/hydromet/sources" replace />} />
                <Route path="sources" element={
                  <ProtectedRoute requiredPermission="view sources">
                    <SourcesPage />
                  </ProtectedRoute>
                } />
                <Route path="stations" element={
                  <ProtectedRoute requiredPermission="view stations">
                    <StationsPage />
                  </ProtectedRoute>
                } />
                <Route path="aquifers" element={
                  <ProtectedRoute requiredPermission="view sources">
                    <AquiferManagementPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/costing" element={
                <ProtectedRoute>
                  <CostingLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/costing/budgets" replace />} />
                <Route path="budgets" element={
                  <ProtectedRoute requiredPermission="view budgets">
                    <BudgetListPage />
                  </ProtectedRoute>
                } />
                <Route path="budgets/:id" element={
                  <ProtectedRoute requiredPermission="view budgets">
                    <BudgetDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="allocations" element={
                  <ProtectedRoute requiredPermission="view allocations">
                    <AllocationConsolePage />
                  </ProtectedRoute>
                } />
                <Route path="cost-to-serve" element={
                  <ProtectedRoute requiredPermission="view cost to serve">
                    <CostToServeDashboard />
                  </ProtectedRoute>
                } />
                <Route path="gl-accounts" element={
                  <ProtectedRoute requiredPermission="view budgets">
                    <GlAccountsPage />
                  </ProtectedRoute>
                } />
                <Route path="cost-centers" element={
                  <ProtectedRoute requiredPermission="view budgets">
                    <CostCentersPage />
                  </ProtectedRoute>
                } />
                <Route path="energy/tariffs" element={
                  <ProtectedRoute requiredPermission="view energy tariffs">
                    <EnergyTariffSetup />
                  </ProtectedRoute>
                } />
                <Route path="energy/readings" element={
                  <ProtectedRoute requiredPermission="upload energy readings">
                    <EnergyReadingsUpload />
                  </ProtectedRoute>
                } />
                <Route path="energy/dashboard" element={
                  <ProtectedRoute requiredPermission="view energy dashboard">
                    <EnergyCostDashboard />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/procurement" element={
                <ProtectedRoute>
                  <CostingLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/procurement/requisitions" replace />} />
                <Route path="requisitions" element={
                  <ProtectedRoute requiredPermission="view requisitions">
                    <RequisitionsPage />
                  </ProtectedRoute>
                } />
                <Route path="rfqs" element={
                  <ProtectedRoute requiredPermission="view rfqs">
                    <RFQBuilderPage />
                  </ProtectedRoute>
                } />
                <Route path="lpos" element={
                  <ProtectedRoute requiredPermission="view lpos">
                    <LPOManagementPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/me" element={
                <ProtectedRoute>
                  <MELayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/me/kpis" replace />} />
                <Route path="kpis" element={
                  <ProtectedRoute>
                    <KPIDashboard />
                  </ProtectedRoute>
                } />
                <Route path="coverage" element={
                  <ProtectedRoute>
                    <CoverageAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="nrw" element={
                  <ProtectedRoute>
                    <NRWTracker />
                  </ProtectedRoute>
                } />
                <Route path="cx" element={
                  <ProtectedRoute>
                    <CXAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="indicators" element={
                  <ProtectedRoute>
                    <ResultsFramework />
                  </ProtectedRoute>
                } />
                <Route path="gender-equity" element={
                  <ProtectedRoute>
                    <GenderEquityReportingPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/customer" element={
                <ProtectedRoute>
                  <CustomerLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/customer/tariffs" replace />} />
                <Route path="tariffs" element={
                  <ProtectedRoute>
                    <Tariffs />
                  </ProtectedRoute>
                } />
                <Route path="billing" element={
                  <ProtectedRoute>
                    <BillingRuns />
                  </ProtectedRoute>
                } />
                <Route path="payments" element={
                  <ProtectedRoute>
                    <PaymentReconciliation />
                  </ProtectedRoute>
                } />
                <Route path="meter-routes" element={
                  <ProtectedRoute>
                    <MeterRoutes />
                  </ProtectedRoute>
                } />
                <Route path="tickets" element={
                  <ProtectedRoute>
                    <Tickets />
                  </ProtectedRoute>
                } />
                <Route path="kiosks" element={
                  <ProtectedRoute>
                    <Kiosks />
                  </ProtectedRoute>
                } />
                <Route path="trucking" element={
                  <ProtectedRoute>
                    <WaterTrucking />
                  </ProtectedRoute>
                } />
                <Route path="connections" element={
                  <ProtectedRoute>
                    <Connections />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/community" element={
                <ProtectedRoute>
                  <CommunityLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/community/committees" replace />} />
                <Route path="committees" element={
                  <ProtectedRoute>
                    <CommitteesDirectory />
                  </ProtectedRoute>
                } />
                <Route path="committees/:id" element={
                  <ProtectedRoute>
                    <CommitteeProfile />
                  </ProtectedRoute>
                } />
                <Route path="finance" element={
                  <ProtectedRoute>
                    <CommitteeFinance />
                  </ProtectedRoute>
                } />
                <Route path="vendors" element={
                  <ProtectedRoute>
                    <VendorPortal />
                  </ProtectedRoute>
                } />
                <Route path="bids" element={
                  <ProtectedRoute>
                    <BidsCenter />
                  </ProtectedRoute>
                } />
                <Route path="deliveries" element={
                  <ProtectedRoute>
                    <VendorDeliveries />
                  </ProtectedRoute>
                } />
                <Route path="stakeholders" element={
                  <ProtectedRoute>
                    <StakeholderMap />
                  </ProtectedRoute>
                } />
                <Route path="engagements" element={
                  <ProtectedRoute>
                    <EngagementPlanner />
                  </ProtectedRoute>
                } />
                <Route path="grm" element={
                  <ProtectedRoute>
                    <GRMConsole />
                  </ProtectedRoute>
                } />
                <Route path="open-data" element={
                  <ProtectedRoute>
                    <OpenDataCatalog />
                  </ProtectedRoute>
                } />
                <Route path="dataset-builder" element={
                  <ProtectedRoute>
                    <DatasetBuilder />
                  </ProtectedRoute>
                } />
                <Route path="public-maps" element={
                  <ProtectedRoute>
                    <PublicMaps />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/core-ops" element={
                <ProtectedRoute>
                  <CoreOpsLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/core-ops/console" replace />} />
                <Route path="console" element={
                  <ProtectedRoute requiredPermission="core_ops.view_operations">
                    <OperationsConsole />
                  </ProtectedRoute>
                } />
                <Route path="topology" element={
                  <ProtectedRoute requiredPermission="core_ops.view_topology">
                    <TopologyViewer />
                  </ProtectedRoute>
                } />
                <Route path="telemetry" element={
                  <ProtectedRoute requiredPermission="core_ops.view_telemetry">
                    <TelemetryPageWithForms />
                  </ProtectedRoute>
                } />
                <Route path="network" element={
                  <ProtectedRoute requiredPermission="core_ops.view_topology">
                    <NetworkMapPage />
                  </ProtectedRoute>
                } />
                <Route path="outages" element={
                  <ProtectedRoute requiredPermission="core_ops.view_outages">
                    <OutagePlannerWithForm />
                  </ProtectedRoute>
                } />
                <Route path="nrw" element={
                  <ProtectedRoute requiredPermission="core_ops.view_nrw">
                    <NRWDashboard />
                  </ProtectedRoute>
                } />
                <Route path="dosing" element={
                  <ProtectedRoute requiredPermission="core_ops.view_dosing">
                    <DosingControl />
                  </ProtectedRoute>
                } />
                <Route path="scheduling" element={
                  <ProtectedRoute requiredPermission="core_ops.view_scheduling">
                    <PumpScheduling />
                  </ProtectedRoute>
                } />
                <Route path="pressure-leak" element={
                  <ProtectedRoute requiredPermission="core_ops.view_operations">
                    <PressureLeakPage />
                  </ProtectedRoute>
                } />
                <Route path="shifts" element={
                  <ProtectedRoute requiredPermission="operations.view_shifts">
                    <ShiftsPage />
                  </ProtectedRoute>
                } />
                <Route path="events" element={
                  <ProtectedRoute requiredPermission="operations.view_events">
                    <EventsPage />
                  </ProtectedRoute>
                } />
                <Route path="checklists" element={
                  <ProtectedRoute requiredPermission="operations.view_checklists">
                    <ChecklistsPage />
                  </ProtectedRoute>
                } />
                <Route path="playbooks" element={
                  <ProtectedRoute requiredPermission="operations.view_playbooks">
                    <PlaybooksPage />
                  </ProtectedRoute>
                } />
                <Route path="escalation-policies" element={
                  <ProtectedRoute requiredPermission="operations.view_escalation_policies">
                    <EscalationPoliciesPage />
                  </ProtectedRoute>
                } />
                <Route path="predictions" element={
                  <ProtectedRoute requiredPermission="core_ops.view_operations">
                    <PredictionsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="workflows/definitions" element={
                  <ProtectedRoute requiredPermission="workflows.view">
                    <WorkflowDefinitionsPage />
                  </ProtectedRoute>
                } />
                <Route path="workflows/instances" element={
                  <ProtectedRoute requiredPermission="workflows.view">
                    <WorkflowInstancesPage />
                  </ProtectedRoute>
                } />
                <Route path="droughts" element={
                  <ProtectedRoute requiredPermission="core_ops.view_operations">
                    <DroughtResponsePage />
                  </ProtectedRoute>
                } />
              </Route>

              <Route path="/risk-compliance" element={
                <ProtectedRoute>
                  <RiskComplianceLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/risk-compliance/home" replace />} />
                <Route path="home" element={
                  <ProtectedRoute requiredPermission="risk.view">
                    <RiskComplianceHome />
                  </ProtectedRoute>
                } />
                <Route path="risks" element={
                  <ProtectedRoute requiredPermission="risk.view">
                    <RiskRegisterPage />
                  </ProtectedRoute>
                } />
                <Route path="incidents" element={
                  <ProtectedRoute requiredPermission="compliance.view">
                    <IncidentsPage />
                  </ProtectedRoute>
                } />
                <Route path="bcp" element={
                  <ProtectedRoute requiredPermission="compliance.view">
                    <BCPPage />
                  </ProtectedRoute>
                } />
                <Route path="regulatory-reporting" element={
                  <ProtectedRoute requiredPermission="compliance.view">
                    <RegulatoryReportingPage />
                  </ProtectedRoute>
                } />
                <Route path="policies" element={
                  <ProtectedRoute requiredPermission="compliance.view">
                    <PoliciesPage />
                  </ProtectedRoute>
                } />
                <Route path="audit" element={
                  <ProtectedRoute requiredPermission="audit.view">
                    <InternalAuditPage />
                  </ProtectedRoute>
                } />
                <Route path="hse" element={
                  <ProtectedRoute requiredPermission="hse.view">
                    <HSEPage />
                  </ProtectedRoute>
                } />
                <Route path="dpo" element={
                  <ProtectedRoute requiredPermission="compliance.dpo">
                    <DPOPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={
                  <ProtectedRoute requiredPermission="rbac.view">
                    <UsersManagement />
                  </ProtectedRoute>
                } />
                <Route path="rbac/roles" element={
                  <ProtectedRoute requiredPermission="rbac.view">
                    <RolesPermissions />
                  </ProtectedRoute>
                } />
                <Route path="rbac/matrix" element={
                  <ProtectedRoute requiredPermission="rbac.view">
                    <PermissionMatrix />
                  </ProtectedRoute>
                } />
                <Route path="audit" element={
                  <ProtectedRoute requiredPermission="audit.view">
                    <AuditLogs />
                  </ProtectedRoute>
                } />
                <Route path="security/alerts" element={
                  <ProtectedRoute requiredPermission="security.view">
                    <SecurityAlertsPage />
                  </ProtectedRoute>
                } />
                <Route path="security/api-keys" element={
                  <ProtectedRoute requiredPermission="security.view">
                    <ApiKeysPage />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute requiredPermission="settings.manage">
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="rbac/menu-access" element={
                  <ProtectedRoute requiredPermission="rbac.manage">
                    <RoleMenuAccessPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/integration" element={
                <ProtectedRoute>
                  <IntegrationLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/integration/api" replace />} />
                <Route path="api" element={
                  <ProtectedRoute requiredPermission="integration.api.view">
                    <ApiCatalogPage />
                  </ProtectedRoute>
                } />
                <Route path="mdm" element={
                  <ProtectedRoute requiredPermission="integration.mdm.view">
                    <MdmEntityHubsPage />
                  </ProtectedRoute>
                } />
                <Route path="sso" element={
                  <ProtectedRoute requiredPermission="integration.sso.view">
                    <SsoConfigPage />
                  </ProtectedRoute>
                } />
                <Route path="edrms" element={
                  <ProtectedRoute requiredPermission="integration.edrms.view">
                    <EdRmsPage />
                  </ProtectedRoute>
                } />
                <Route path="dw-lineage" element={
                  <ProtectedRoute requiredPermission="integration.dw.view">
                    <DataWarehousePage />
                  </ProtectedRoute>
                } />
                <Route path="dw" element={
                  <ProtectedRoute requiredPermission="integration.dw.view">
                    <DataWarehousePage />
                  </ProtectedRoute>
                } />
                <Route path="notifications" element={
                  <ProtectedRoute requiredPermission="integration.notifications.view">
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
                <Route path="devices" element={
                  <ProtectedRoute requiredPermission="integration.devices.view">
                    <DeviceRegistryPage />
                  </ProtectedRoute>
                } />
                <Route path="observability" element={
                  <ProtectedRoute requiredPermission="integration.observability.view">
                    <ObservabilityPage />
                  </ProtectedRoute>
                } />
                <Route path="backup-dr" element={
                  <ProtectedRoute requiredPermission="integration.backup.view">
                    <BackupDrPage />
                  </ProtectedRoute>
                } />
                <Route path="secrets" element={
                  <ProtectedRoute requiredPermission="integration.secrets.view">
                    <SecretsVaultPage />
                  </ProtectedRoute>
                } />
                <Route path="connectors" element={
                  <ProtectedRoute requiredPermission="integration.connectors.view">
                    <ConnectorGallery />
                  </ProtectedRoute>
                } />
                <Route path="webhooks" element={
                  <ProtectedRoute requiredPermission="integration.webhooks.view">
                    <WebhookManager />
                  </ProtectedRoute>
                } />
                <Route path="etl" element={
                  <ProtectedRoute requiredPermission="integration.etl.view">
                    <ETLJobs />
                  </ProtectedRoute>
                } />
                <Route path="comms" element={
                  <ProtectedRoute requiredPermission="integration.comms.view">
                    <CommunicationTemplates />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="/training" element={
                <ProtectedRoute>
                  <TrainingLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/training/courses" replace />} />
                <Route path="courses" element={<CourseCatalog />} />
                <Route path="my-learning" element={<MyLearning />} />
                <Route path="kb" element={<KnowledgeBase />} />
                <Route path="sops" element={<SopsPage />} />
                <Route path="skills" element={<SkillsMatrix />} />
                <Route path="certificates" element={<CertificatesPage />} />
                <Route path="assessments" element={<CapacityAssessmentPage />} />
              </Route>
              
              <Route path="/dsa" element={
                <ProtectedRoute>
                  <DSALayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dsa/forecast" replace />} />
                <Route path="forecast" element={
                  <ProtectedRoute requiredPermission="dsa.view_forecast">
                    <ForecastStudioPage />
                  </ProtectedRoute>
                } />
                <Route path="scenarios" element={
                  <ProtectedRoute requiredPermission="dsa.view_scenarios">
                    <ScenarioWorkbenchPage />
                  </ProtectedRoute>
                } />
                <Route path="optimize" element={
                  <ProtectedRoute requiredPermission="dsa.view_optimization">
                    <OptimizationConsolePage />
                  </ProtectedRoute>
                } />
                <Route path="anomalies" element={
                  <ProtectedRoute requiredPermission="dsa.view_anomalies">
                    <AnomaliesInboxPage />
                  </ProtectedRoute>
                } />
                <Route path="aquifer" element={
                  <ProtectedRoute requiredPermission="dsa.view_hydro">
                    <AquiferDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="tariffs" element={
                  <ProtectedRoute requiredPermission="dsa.view_tariffs">
                    <TariffSandboxPage />
                  </ProtectedRoute>
                } />
                <Route path="ews" element={
                  <ProtectedRoute requiredPermission="dsa.view_ews">
                    <EWSConsolePage />
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
