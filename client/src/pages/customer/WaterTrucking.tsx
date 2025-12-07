import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, MapPin, Clock, DollarSign, Droplets, CheckCircle, AlertCircle, Wrench, Navigation } from 'lucide-react';

interface WaterTruck {
  id: number;
  truck_no: string;
  driver_name: string;
  phone: string;
  capacity: number;
  status: 'available' | 'in_transit' | 'maintenance';
  trips_today: number;
  revenue_today: number;
}

interface TruckTrip {
  id: string;
  trip_code: string;
  truck_registration: string;
  driver_name: string;
  driver_phone: string;
  volume_m3: number;
  price_per_m3: number;
  total_amount: number;
  source_location: string;
  delivery_location: string;
  departure_time: string;
  arrival_time: string | null;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'verified';
  notes: string | null;
}

interface TruckSummary {
  total_trucks: number;
  available_trucks: number;
  in_transit_trucks: number;
  maintenance_trucks: number;
  total_trips_today: number;
  total_revenue_today: number;
  total_capacity: number;
}

interface TripSummary {
  total_trips: number;
  total_revenue: number;
  total_volume: number;
  completed_trips: number;
  active_trips: number;
  scheduled_trips: number;
}

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-800', icon: Navigation },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
  scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-800', icon: Clock },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  verified: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
};

export function WaterTrucking() {
  const [activeTab, setActiveTab] = useState('trucks');

  const { data: trucksData, isLoading: trucksLoading } = useQuery({
    queryKey: ['/api/v1/crm/water-trucks'],
  });

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['/api/v1/crm/water-trucks/trips'],
  });

  const trucks: WaterTruck[] = trucksData?.data || [];
  const truckSummary: TruckSummary = trucksData?.summary || {
    total_trucks: 0,
    available_trucks: 0,
    in_transit_trucks: 0,
    maintenance_trucks: 0,
    total_trips_today: 0,
    total_revenue_today: 0,
    total_capacity: 0,
  };

  const trips: TruckTrip[] = tripsData?.data || [];
  const tripSummary: TripSummary = tripsData?.summary || {
    total_trips: 0,
    total_revenue: 0,
    total_volume: 0,
    completed_trips: 0,
    active_trips: 0,
    scheduled_trips: 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Water Trucking</h1>
        <p className="text-muted-foreground mt-1">Bowser management and trip tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{truckSummary.total_trucks}</div>
            <p className="text-xs text-muted-foreground">
              {truckSummary.available_trucks} available, {truckSummary.in_transit_trucks} in transit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trips Today</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{truckSummary.total_trips_today}</div>
            <p className="text-xs text-muted-foreground">
              {tripSummary.active_trips} active, {tripSummary.scheduled_trips} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Delivered</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(tripSummary.total_volume || 0).toFixed(1)} m³</div>
            <p className="text-xs text-muted-foreground">
              Total capacity: {(truckSummary.total_capacity / 1000).toFixed(1)} m³
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(truckSummary.total_revenue_today || 0))}</div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(Number(tripSummary.total_revenue || 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trucks">Fleet</TabsTrigger>
          <TabsTrigger value="trips">Trip Log</TabsTrigger>
        </TabsList>

        <TabsContent value="trucks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Water Truck Fleet
              </CardTitle>
              <CardDescription>Manage bowsers and track their status</CardDescription>
            </CardHeader>
            <CardContent>
              {trucksLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading trucks...</div>
              ) : trucks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No water trucks registered</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Truck No.</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Capacity (L)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Trips Today</TableHead>
                      <TableHead className="text-right">Revenue Today</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trucks.map((truck) => {
                      const status = statusConfig[truck.status];
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={truck.id}>
                          <TableCell className="font-medium">{truck.truck_no}</TableCell>
                          <TableCell>{truck.driver_name}</TableCell>
                          <TableCell>{truck.phone}</TableCell>
                          <TableCell className="text-right">{truck.capacity.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{truck.trips_today}</TableCell>
                          <TableCell className="text-right">{formatCurrency(truck.revenue_today)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Trip Log
              </CardTitle>
              <CardDescription>Track water delivery trips</CardDescription>
            </CardHeader>
            <CardContent>
              {tripsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading trips...</div>
              ) : trips.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No trips recorded</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trip Code</TableHead>
                      <TableHead>Truck</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead className="text-right">Volume (m³)</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip) => {
                      const status = statusConfig[trip.status];
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={trip.id}>
                          <TableCell className="font-medium">{trip.trip_code}</TableCell>
                          <TableCell>{trip.truck_registration}</TableCell>
                          <TableCell>{trip.driver_name}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={trip.source_location}>
                            {trip.source_location}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={trip.delivery_location}>
                            {trip.delivery_location}
                          </TableCell>
                          <TableCell className="text-right">{Number(trip.volume_m3).toFixed(1)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(trip.total_amount))}</TableCell>
                          <TableCell>{formatDateTime(trip.departure_time)}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
