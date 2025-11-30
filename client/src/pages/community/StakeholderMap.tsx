import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Globe, AlertTriangle, Calendar, MessageSquare, FileText } from 'lucide-react';
import { StakeholderRegistry } from './StakeholderRegistry';
import { InfluenceInterestMatrix } from './InfluenceInterestMatrix';
import { EngagementTimeline } from './EngagementTimeline';
import { EngagementPlanTemplates } from './EngagementPlanTemplates';
import { BulkEngagementScheduler } from './BulkEngagementScheduler';
import { CommunicationLogs } from './CommunicationLogs';
import { apiClient } from '../../lib/api-client';

interface MatrixData {
  vulnerable: number;
  highInfluenceHighInterest: number;
}

export function StakeholderMap() {
  const [activeTab, setActiveTab] = useState('registry');
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [pendingFollowUps, setPendingFollowUps] = useState(3);

  useEffect(() => {
    apiClient.get<{ data: MatrixData }>('/community/stakeholder-matrix')
      .then(res => {
        const data = res.data || res;
        setMatrixData(data as MatrixData);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stakeholder Mapping</h1>
          <p className="text-muted-foreground mt-1">Stakeholder registry, influence/interest analysis, and engagement tracking</p>
        </div>
        {pendingFollowUps > 0 && (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {pendingFollowUps} follow-ups pending
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stakeholders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">All categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Influence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matrixData?.highInfluenceHighInterest || 32}</div>
            <p className="text-xs text-muted-foreground">Key decision makers</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Vulnerable Groups</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{matrixData?.vulnerable || 18}</div>
            <p className="text-xs text-orange-600">Requiring special attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Engagements completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="registry" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Registry
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs">
                <TrendingUp className="h-4 w-4 mr-1" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs">
                <Calendar className="h-4 w-4 mr-1" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                <FileText className="h-4 w-4 mr-1" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="scheduler" className="text-xs">
                <Calendar className="h-4 w-4 mr-1" />
                Scheduler
              </TabsTrigger>
              <TabsTrigger value="comms" className="text-xs">
                <MessageSquare className="h-4 w-4 mr-1" />
                Comms Log
              </TabsTrigger>
            </TabsList>
            <TabsContent value="registry" className="mt-4">
              <StakeholderRegistry />
            </TabsContent>
            <TabsContent value="analysis" className="mt-4">
              <InfluenceInterestMatrix />
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <EngagementTimeline />
            </TabsContent>
            <TabsContent value="templates" className="mt-4">
              <EngagementPlanTemplates />
            </TabsContent>
            <TabsContent value="scheduler" className="mt-4">
              <BulkEngagementScheduler />
            </TabsContent>
            <TabsContent value="comms" className="mt-4">
              <CommunicationLogs />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
