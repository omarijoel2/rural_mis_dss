import { useMemo } from 'react';

interface ModuleConfig {
  name: string;
  isEnabled: boolean;
  hasRoleAccess: boolean;
}

interface User {
  role?: string;
}

export function useAvailableModules(userRole?: string) {
  const defaultUserRole = userRole || 'viewer';

  // Module settings (from DB in production, mocked here)
  const moduleSettings: Record<string, { isEnabled: boolean; moduleName: string }> = {
    'core-registry': { isEnabled: true, moduleName: 'Core Registry' },
    'core-ops': { isEnabled: true, moduleName: 'Core Operations' },
    'crm': { isEnabled: true, moduleName: 'CRM' },
    'cmms': { isEnabled: true, moduleName: 'CMMS' },
    'water-quality': { isEnabled: true, moduleName: 'Water Quality' },
    'hydromet': { isEnabled: true, moduleName: 'Hydromet' },
    'costing': { isEnabled: true, moduleName: 'Costing & Finance' },
    'procurement': { isEnabled: true, moduleName: 'Procurement' },
    'projects': { isEnabled: true, moduleName: 'Projects' },
    'community': { isEnabled: true, moduleName: 'Community & Stakeholder' },
    'risk-compliance': { isEnabled: true, moduleName: 'Risk, Compliance & Governance' },
    'dsa': { isEnabled: true, moduleName: 'Decision Support & Analytics' },
    'training': { isEnabled: true, moduleName: 'Training & Knowledge' },
    'me': { isEnabled: true, moduleName: 'M&E' },
  };

  // Role-based access control (from DB in production)
  const roleModuleAccess: Record<string, string[]> = {
    'admin': Object.keys(moduleSettings),
    'manager': ['core-registry', 'core-ops', 'crm', 'cmms', 'water-quality', 'projects', 'costing'],
    'operator': ['core-ops', 'cmms', 'water-quality'],
    'analyst': ['dsa', 'me', 'costing', 'core-registry'],
    'viewer': ['core-registry', 'me', 'dsa'],
  };

  const availableModules = useMemo(() => {
    const userModuleAccess = roleModuleAccess[defaultUserRole] || [];

    const result: Record<string, ModuleConfig> = {};

    Object.entries(moduleSettings).forEach(([key, settings]) => {
      result[key] = {
        ...settings,
        isEnabled: settings.isEnabled,
        hasRoleAccess: userModuleAccess.includes(key),
      };
    });

    return result;
  }, [defaultUserRole]);

  const isModuleAvailable = (moduleKey: string): boolean => {
    const config = availableModules[moduleKey];
    return config ? config.isEnabled && config.hasRoleAccess : false;
  };

  const getAvailableModuleKeys = (): string[] => {
    return Object.entries(availableModules)
      .filter(([_, config]) => config.isEnabled && config.hasRoleAccess)
      .map(([key]) => key);
  };

  return {
    availableModules,
    isModuleAvailable,
    getAvailableModuleKeys,
  };
}
