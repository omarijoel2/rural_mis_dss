import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function CertificatesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">
          View and download your training certificates
        </p>
      </div>

      <Card className="p-12 text-center">
        <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Certificates Coming Soon</p>
        <p className="text-sm text-muted-foreground">
          Complete courses to earn certificates that will appear here
        </p>
      </Card>
    </div>
  );
}
