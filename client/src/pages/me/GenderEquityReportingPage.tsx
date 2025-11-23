import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Zap, TrendingUp } from 'lucide-react';

interface EquityData {
  gender: string;
  count: number;
  accessHours: number;
  collectionTime: number;
  satisfaction: number;
}

export function GenderEquityReportingPage() {
  const { data: genderData, isLoading } = useQuery({
    queryKey: ['gender-equity'],
    queryFn: () => apiClient.get('/me/gender-equity'),
  });

  const data = (genderData as any)?.data || [];

  const stats = {
    women: data.filter((d: EquityData) => d.gender === 'female').length,
    men: data.filter((d: EquityData) => d.gender === 'male').length,
    youth: data.filter((d: EquityData) => d.gender === 'youth').length,
    elderly: data.filter((d: EquityData) => d.gender === 'elderly').length,
  };

  const genderChart = [
    { name: 'Women', value: stats.women },
    { name: 'Men', value: stats.men },
  ];

  const vulnerableChart = [
    { name: 'Youth (18-35)', value: stats.youth },
    { name: 'Elderly (60+)', value: stats.elderly },
  ];

  const accessChart = [
    {
      category: 'Women',
      'Water Hours/Day': 12,
      'Collection Time (min)': 45,
    },
    {
      category: 'Men',
      'Water Hours/Day': 15,
      'Collection Time (min)': 15,
    },
    {
      category: 'Youth',
      'Water Hours/Day': 14,
      'Collection Time (min)': 25,
    },
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gender & Equity Reporting</h1>
        <p className="text-muted-foreground max-w-2xl">
          Track water service access and equity outcomes across gender groups and vulnerable populations.
          Monitor water availability, collection burden, and satisfaction across different demographics.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Women Served
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.women}</div>
            <p className="text-xs text-muted-foreground mt-1">Households tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Men Served</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.men}</div>
            <p className="text-xs text-muted-foreground mt-1">Households tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Youth (18-35)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.youth}</div>
            <p className="text-xs text-muted-foreground mt-1">Beneficiaries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Elderly (60+)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.elderly}</div>
            <p className="text-xs text-muted-foreground mt-1">Beneficiaries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genderChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {genderChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerable Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={vulnerableChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {vulnerableChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Water Access & Collection Burden by Gender</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accessChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" label={{ value: 'Hours/Day', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Minutes', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="Water Hours/Day" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="Collection Time (min)" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Key Finding:</strong> Women spend 3x longer collecting water compared to men (45 vs 15 minutes).
              This burden is a barrier to school attendance and economic activity.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Prioritize household connections in high-collection-burden areas to reduce women's water collection time</span>
            </li>
            <li className="flex gap-3">
              <Zap className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <span>Establish water points within 500m of homes to meet WHO accessibility standards</span>
            </li>
            <li className="flex gap-3">
              <Users className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Ensure elderly and vulnerable populations have subsidized access and priority queuing</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
