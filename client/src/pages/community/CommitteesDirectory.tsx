import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Calendar, CheckCircle, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface Committee {
  id: string;
  name: string;
  community: string;
  members: number;
  complianceScore: number;
  status: string;
}

export function CommitteesDirectory() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/datasets/committees')
      .then(r => r.json())
      .then(d => setCommittees(d.data || []))
      .catch(() => setCommittees([
        { id: '1', name: 'Kiambu Water Committee', community: 'Kiambu', members: 12, complianceScore: 92, status: 'active' },
        { id: '2', name: 'Kajiado Water Committee', community: 'Kajiado', members: 10, complianceScore: 85, status: 'active' },
        { id: '3', name: 'Machakos Water Committee', community: 'Machakos', members: 14, complianceScore: 78, status: 'active' },
      ]));
  }, []);

  const filtered = committees.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.community.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">RWSS Committees Directory</h1>
          <p className="text-muted-foreground mt-1">Community water committee registry and governance</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Committee</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Committees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{committees.length}</div>
            <p className="text-xs text-muted-foreground">Across all schemes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elections Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Within next 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Average governance score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Committee Registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search committees..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline"><Search className="h-4 w-4" /></Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Committee Name</th>
                  <th className="text-left py-2 px-2">Community</th>
                  <th className="text-left py-2 px-2">Members</th>
                  <th className="text-left py-2 px-2">Compliance</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{c.name}</td>
                    <td className="py-2 px-2">{c.community}</td>
                    <td className="py-2 px-2">{c.members}</td>
                    <td className="py-2 px-2">{c.complianceScore}%</td>
                    <td className="py-2 px-2"><Badge variant="default">{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
