import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search } from 'lucide-react';

export function AccountSearchPage() {
  const [accountNo, setAccountNo] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountNo.trim()) {
      navigate(`/crm/accounts/${accountNo.trim()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle>Account 360 Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter Account Number
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., ACC-001"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!accountNo.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter a customer account number to view complete account details, billing history,
              consumption analytics, and revenue assurance cases.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
