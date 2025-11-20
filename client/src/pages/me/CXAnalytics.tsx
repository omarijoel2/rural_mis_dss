import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, ThumbsUp, Star } from 'lucide-react';

export function CXAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Experience Analytics</h1>
        <p className="text-muted-foreground mt-1">NPS, CSAT, and CES tracking and analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Net Promoter Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSAT</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 / 5</div>
            <p className="text-xs text-muted-foreground">Customer Satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28%</div>
            <p className="text-xs text-muted-foreground">Survey participation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Survey management and response analytics coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
