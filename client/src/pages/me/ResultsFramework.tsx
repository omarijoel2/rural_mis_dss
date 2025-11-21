import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function ResultsFramework() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const { data: indicators } = useQuery({
    queryKey: ['indicators', selectedLevel],
    queryFn: async () => {
      const url = new URL('/api/v1/monitoring-evaluation/indicators', window.location.origin);
      if (selectedLevel) url.searchParams.set('level', selectedLevel);
      const res = await fetch(url);
      return res.json();
    },
  });

  const levels = [
    { id: 'impact', label: 'Impact Indicators', color: 'bg-red-100 text-red-800' },
    { id: 'outcome', label: 'Outcome Indicators', color: 'bg-orange-100 text-orange-800' },
    { id: 'output', label: 'Output Indicators', color: 'bg-blue-100 text-blue-800' },
    { id: 'activity', label: 'Activity Indicators', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Results Framework & Logframe</h1>
          <p className="text-muted-foreground mt-1">Impact, outcome, output, and activity indicators with baseline and target tracking</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Indicator
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {levels.map((level) => (
          <Card
            key={level.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{level.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${level.color}`}>
                {indicators?.data?.filter((i: any) => i.level === level.id).length || 0} indicators
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicator Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedLevel ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Displaying {levels.find(l => l.id === selectedLevel)?.label}
              </p>
              {indicators?.data && indicators.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {indicators.data.map((indicator: any) => (
                    <div key={indicator.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{indicator.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{indicator.code}</p>
                          {indicator.target_value && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <TrendingUp className="h-3 w-3" />
                              Target: {indicator.target_value} {indicator.unit || ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No indicators for this level yet</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Select a level to view indicators, manage baselines, targets, and track progress data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
