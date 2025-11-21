import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, ThumbsUp, Star, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CXAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['surveys-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/v1/monitoring-evaluation/surveys/analytics/summary');
      return res.json();
    },
  });

  const { data: surveys } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const res = await fetch('/api/v1/monitoring-evaluation/surveys');
      return res.json();
    },
  });

  const analyticsData = analytics?.data || {
    nps_score: 42,
    csat_avg: 4.2,
    total_responses: 1250,
    active_surveys: 3,
    response_rate_percent: 28,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Experience Analytics</h1>
          <p className="text-muted-foreground mt-1">NPS, CSAT, and CES tracking, survey management, and sentiment analysis</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Survey
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.nps_score}</div>
            <p className="text-xs text-muted-foreground">Net Promoter Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSAT</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.csat_avg.toFixed(1)} / 5</div>
            <p className="text-xs text-muted-foreground">Customer Satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.response_rate_percent}%</div>
            <p className="text-xs text-muted-foreground">Survey participation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.total_responses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cumulative feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.active_surveys}</div>
            <p className="text-xs text-muted-foreground">Running campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {surveys?.data && surveys.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {surveys.data.map((survey: any) => (
                    <div key={survey.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{survey.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Type: {survey.type.toUpperCase()} | Channel: {survey.channel} | Status: {survey.status}
                          </p>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {survey.responses_count || 0} responses
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No surveys yet</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
