import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { crmService } from '../../services/crm.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { MapPin, Filter, Download, Save, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export function SegmentationPage() {
  const [selectedSegments, setSelectedSegments] = useState<Record<string, boolean>>({
    residential: false,
    commercial: false,
    industrial: false,
    public: false,
  });
  const [balanceRange, setBalanceRange] = useState({ min: 0, max: 100000 });
  const [consumptionRange, setConsumptionRange] = useState({ min: 0, max: 10000 });
  const [statusFilter, setStatusFilter] = useState('active');
  const [segmentName, setSegmentName] = useState('');

  const { data: customersData } = useQuery({
    queryKey: ['customers', { per_page: 1000 }],
    queryFn: () => crmService.getCustomers({ per_page: 1000 }),
  });

  const customers = customersData?.data || [];

  const filteredCustomers = customers.filter((customer: any) => {
    const typeMatch =
      Object.values(selectedSegments).some(v => v) === false ||
      selectedSegments[customer.customer_type];
    return typeMatch;
  });

  const segments = [
    { id: 'residential', label: 'Residential', count: customers.filter((c: any) => c.customer_type === 'residential').length, color: 'bg-blue-100 text-blue-800' },
    { id: 'commercial', label: 'Commercial', count: customers.filter((c: any) => c.customer_type === 'commercial').length, color: 'bg-purple-100 text-purple-800' },
    { id: 'industrial', label: 'Industrial', count: customers.filter((c: any) => c.customer_type === 'industrial').length, color: 'bg-orange-100 text-orange-800' },
    { id: 'public', label: 'Public', count: customers.filter((c: any) => c.customer_type === 'public').length, color: 'bg-green-100 text-green-800' },
  ];

  const handleSaveSegment = () => {
    if (!segmentName.trim()) {
      toast.error('Please enter a segment name');
      return;
    }
    toast.success(`Segment "${segmentName}" created with ${filteredCustomers.length} customers`);
    setSegmentName('');
  };

  const handleExport = () => {
    const csv = [
      ['Account', 'Name', 'Type', 'Phone', 'Email'],
      ...filteredCustomers.map((c: any) => [
        c.id,
        `${c.first_name} ${c.last_name}`,
        c.customer_type,
        c.phone,
        c.email || '',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segment-${Date.now()}.csv`;
    a.click();
    toast.success('Segment exported successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Segmentation</h1>
        <p className="text-muted-foreground">Create and manage customer segments for targeted campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Segment Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Customer Type</h3>
                {segments.map(segment => (
                  <div key={segment.id} className="flex items-center gap-2">
                    <Checkbox
                      id={segment.id}
                      checked={selectedSegments[segment.id]}
                      onCheckedChange={(checked) =>
                        setSelectedSegments({ ...selectedSegments, [segment.id]: checked === true })
                      }
                    />
                    <Label htmlFor={segment.id} className="cursor-pointer flex-1">
                      <div className="flex items-center justify-between">
                        <span>{segment.label}</span>
                        <Badge variant="secondary">{segment.count}</Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Status</h3>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Balance Range (KES)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={balanceRange.min}
                      onChange={(e) => setBalanceRange({ ...balanceRange, min: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={balanceRange.max}
                      onChange={(e) => setBalanceRange({ ...balanceRange, max: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Segment Name</Label>
                  <Input
                    placeholder="e.g., High-Value Residential"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={handleSaveSegment} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Segment
                </Button>
                <Button onClick={handleExport} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Segment Overview</span>
                <Badge>{filteredCustomers.length} customers</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {segments.map(segment => (
                  <div key={segment.id} className={`p-4 rounded-lg ${segment.color}`}>
                    <p className="text-sm font-medium opacity-80">{segment.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {
                        filteredCustomers.filter((c: any) => c.customer_type === segment.id).length
                      }
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Segment Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-3xl font-bold">{filteredCustomers.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Percentage of All</p>
                  <p className="text-3xl font-bold">
                    {customers.length > 0
                      ? ((filteredCustomers.length / customers.length) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Customers in Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredCustomers.slice(0, 10).map((customer: any) => (
                  <div key={customer.id} className="border rounded p-2 text-sm">
                    <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                    <p className="text-muted-foreground">{customer.phone}</p>
                  </div>
                ))}
                {filteredCustomers.length > 10 && (
                  <p className="text-sm text-muted-foreground pt-2">
                    +{filteredCustomers.length - 10} more customers
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
