import { useQuery } from '@tanstack/react-query';
import { addressService } from '../../services/address.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { RequirePerm } from '../../components/RequirePerm';

export function AddressesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAll({ per_page: 50 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading addresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error loading addresses: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">Manage customer premises addresses</p>
        </div>
        <RequirePerm permission="create addresses">
          <Button>Create Address</Button>
        </RequirePerm>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((address) => (
          <Card key={address.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{address.premise_code}</CardTitle>
              <CardDescription>
                {[address.street, address.village].filter(Boolean).join(', ') || 'No address details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {address.ward && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ward:</span>
                    <span className="font-medium">{address.ward}</span>
                  </div>
                )}
                {address.subcounty && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subcounty:</span>
                    <span className="font-medium">{address.subcounty}</span>
                  </div>
                )}
                {address.city && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span className="font-medium">{address.city}</span>
                  </div>
                )}
                {address.what3words && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">What3Words:</span>
                    <span className="font-medium text-xs">{address.what3words}</span>
                  </div>
                )}
                {address.scheme && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheme:</span>
                    <span className="font-medium text-xs">{address.scheme.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-lg text-muted-foreground mb-4">No addresses found</p>
            <RequirePerm permission="create addresses">
              <Button>Create Your First Address</Button>
            </RequirePerm>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
