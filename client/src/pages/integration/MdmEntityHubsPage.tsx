import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Users, Building2, MapPin, ShoppingCart, GitMerge, AlertCircle, Plus } from 'lucide-react';

interface MdmEntity {
  id: number;
  sourceSystem: string;
  sourceId: string;
  lastUpdated: string;
  trustScore: number;
  matchesFound: number;
}

interface EntityTab {
  label: string;
  key: string;
  icon: React.ReactNode;
  entities: MdmEntity[];
}

export function MdmEntityHubsPage() {
  const entityTabs: EntityTab[] = [
    {
      label: 'Customers',
      key: 'customers',
      icon: <Users className="h-4 w-4" />,
      entities: [
        {
          id: 1,
          sourceSystem: 'CIS',
          sourceId: 'CUST-001234',
          lastUpdated: '2025-11-24T10:30:00Z',
          trustScore: 92,
          matchesFound: 2,
        },
        {
          id: 2,
          sourceSystem: 'Field App',
          sourceId: 'FIELD-5678',
          lastUpdated: '2025-11-23T15:45:00Z',
          trustScore: 78,
          matchesFound: 1,
        },
      ],
    },
    {
      label: 'Assets',
      key: 'assets',
      icon: <Building2 className="h-4 w-4" />,
      entities: [
        {
          id: 3,
          sourceSystem: 'CMMS',
          sourceId: 'PUMP-001',
          lastUpdated: '2025-11-22T08:00:00Z',
          trustScore: 95,
          matchesFound: 0,
        },
      ],
    },
    {
      label: 'Locations',
      key: 'locations',
      icon: <MapPin className="h-4 w-4" />,
      entities: [
        {
          id: 4,
          sourceSystem: 'GIS',
          sourceId: 'LOC-TURKANA-01',
          lastUpdated: '2025-11-20T12:00:00Z',
          trustScore: 88,
          matchesFound: 3,
        },
      ],
    },
    {
      label: 'Vendors',
      key: 'vendors',
      icon: <ShoppingCart className="h-4 w-4" />,
      entities: [
        {
          id: 5,
          sourceSystem: 'Procurement',
          sourceId: 'VEND-042',
          lastUpdated: '2025-11-24T09:15:00Z',
          trustScore: 72,
          matchesFound: 2,
        },
      ],
    },
  ];

  const [selectedEntity, setSelectedEntity] = useState<MdmEntity | null>(null);
  const [activeTab, setActiveTab] = useState('customers');

  const getTrustScoreBadgeVariant = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const currentTabEntities = entityTabs.find(t => t.key === activeTab)?.entities || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Master Data Management</h1>
        <p className="text-muted-foreground">Deduplicate and manage golden records across source systems</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {entityTabs.map(tab => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-2">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {entityTabs.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{tab.label}</h2>
                <p className="text-sm text-muted-foreground">{tab.entities.length} entities found</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add {tab.label.slice(0, -1)}
              </Button>
            </div>

            {/* Entity List */}
            <div className="space-y-2">
              {currentTabEntities.map(entity => (
                <Card 
                  key={entity.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedEntity(entity)}
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="font-medium text-sm">{entity.sourceSystem}</p>
                        <p className="text-xs text-muted-foreground">{entity.sourceId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">LAST UPDATED</p>
                        <p className="text-sm">{new Date(entity.lastUpdated).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">TRUST SCORE</p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTrustScoreBadgeVariant(entity.trustScore)}`}>
                          {entity.trustScore}%
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">POTENTIAL MATCHES</p>
                        <Badge variant={entity.matchesFound > 0 ? 'default' : 'secondary'}>
                          {entity.matchesFound} found
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-2">
                        {entity.matchesFound > 0 && (
                          <Button size="sm" variant="default">
                            <GitMerge className="h-4 w-4 mr-1" />
                            Review Matches
                          </Button>
                        )}
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected Entity Detail */}
      {selectedEntity && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5" />
              Entity Details
            </CardTitle>
            <CardDescription>Source: {selectedEntity.sourceSystem} | ID: {selectedEntity.sourceId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEntity.matchesFound > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-900 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{selectedEntity.matchesFound} potential duplicate(s) detected</span>
                </div>
                <p className="text-xs text-amber-700 mt-1">Click "Review Matches" to resolve duplicates using the merge workbench.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">TRUST SCORE</p>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${selectedEntity.trustScore >= 85 ? 'bg-green-500' : selectedEntity.trustScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${selectedEntity.trustScore}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium mt-1">{selectedEntity.trustScore}%</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">SOURCE SYSTEM</p>
                <p className="text-sm font-medium mt-1">{selectedEntity.sourceSystem}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">TOTAL ENTITIES</p>
            <p className="text-3xl font-bold mt-1">{entityTabs.reduce((sum, t) => sum + t.entities.length, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">AVG TRUST SCORE</p>
            <p className="text-3xl font-bold mt-1">82%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">PENDING MERGES</p>
            <p className="text-3xl font-bold mt-1">4</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">COMPLETED MERGES</p>
            <p className="text-3xl font-bold mt-1">12</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
