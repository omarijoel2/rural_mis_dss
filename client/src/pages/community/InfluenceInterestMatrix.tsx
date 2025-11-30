import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiClient } from '../../lib/api-client';

interface MatrixData {
  champions: number;
  keysupporters: number;
  neutral: number;
  resistors: number;
  vulnerable: number;
  highInfluenceHighInterest: number;
  highInfluenceLowInterest: number;
  lowInfluenceHighInterest: number;
  lowInfluenceLowInterest: number;
}

export function InfluenceInterestMatrix() {
  const [matrix, setMatrix] = useState<MatrixData | null>(null);

  useEffect(() => {
    apiClient.get<{ data: MatrixData }>('/community/stakeholder-matrix')
      .then(res => {
        const data = res.data || res;
        setMatrix(data as MatrixData);
      })
      .catch(err => console.error(err));
  }, []);

  if (!matrix) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Influence & Interest Analysis</h2>
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-green-50">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-600">{matrix.highInfluenceHighInterest}</div>
            <p className="text-sm text-green-700 font-medium">Champions</p>
            <p className="text-xs text-green-600">High Influence, High Interest</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-yellow-600">{matrix.highInfluenceLowInterest}</div>
            <p className="text-sm text-yellow-700 font-medium">Key Supporters</p>
            <p className="text-xs text-yellow-600">High Influence, Low Interest</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-600">{matrix.lowInfluenceHighInterest}</div>
            <p className="text-sm text-blue-700 font-medium">Engaged Community</p>
            <p className="text-xs text-blue-600">Low Influence, High Interest</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-gray-600">{matrix.lowInfluenceLowInterest}</div>
            <p className="text-sm text-gray-700 font-medium">General Public</p>
            <p className="text-xs text-gray-600">Low Influence, Low Interest</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
