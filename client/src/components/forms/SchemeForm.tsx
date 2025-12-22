import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lookupsAPI } from '@/lib/api';

const schemeSchema = z.object({
  code: z.string().min(1, 'Code required').transform((s) => s.toUpperCase()),
  name: z.string().min(1, 'Name required'),
  type: z.enum(['urban', 'rural', 'mixed']),
  status: z.enum(['active', 'planning', 'decommissioned']),
  county: z.string().optional(),
  population_estimate: z.coerce.number().optional(),
});

type SchemeFormData = z.input<typeof schemeSchema>;
type SchemeFormOutput = z.output<typeof schemeSchema>;

interface SchemeFormProps {
  onSubmit: (data: SchemeFormData) => Promise<void>;
  defaultValues?: Partial<SchemeFormData>;
  isLoading?: boolean;
  externalErrors?: Record<string, string[]>;
}

export function SchemeForm({ onSubmit, defaultValues, isLoading }: SchemeFormProps) {
  const mapType = (t?: string | null) => {
    if (!t) return 'rural';
    const legacy = String(t).toLowerCase();
    if (legacy === 'piped' || legacy === 'urban') return 'urban';
    if (['handpump', 'borehole', 'spring', 'rural'].includes(legacy)) return 'rural';
    return 'mixed';
  };

  const initialValues: Partial<SchemeFormData> = {
    status: (defaultValues as any)?.status || 'active',
    type: mapType((defaultValues as any)?.type),
    code: (defaultValues as any)?.code || '',
    name: (defaultValues as any)?.name || '',
    county: (defaultValues as any)?.county || '',
    population_estimate: (defaultValues as any)?.population_estimate as any || undefined,
  };

  const form = useForm<SchemeFormData>({
    resolver: zodResolver(schemeSchema),
    defaultValues: initialValues as any,
  });

  const [counties, setCounties] = useState<Array<{ id: number; name: string; value: string }>>([]);

  useEffect(() => {
    let mounted = true;
    lookupsAPI
      .list('county')
      .then((res: any) => {
        if (!mounted) return;
        setCounties(res?.data || []);
      })
      .catch(() => {
        // silently ignore; fallback will keep Input visible
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Map external server-side validation errors to react-hook-form field errors
    // externalErrors shape: { fieldName: ['error message', ...], ... }
    if ((externalErrors as any) && Object.keys(externalErrors).length > 0) {
      Object.entries(externalErrors).forEach(([field, messages]) => {
        form.setError(field as any, { type: 'server', message: (messages as any).join(' ') });
      });
    }
  }, [externalErrors]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheme Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., TRK_LOD_001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheme Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lodwar Water Supply Scheme" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value ?? (initialValues.type as string)} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value ?? (initialValues.status as string)} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="county"
          render={({ field }) => (
            <FormItem>
              <FormLabel>County</FormLabel>
              <FormControl>
                {counties.length > 0 ? (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- None --</SelectItem>
                      {counties.map((c: any) => (
                        <SelectItem key={c.id} value={c.code || c.label}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="e.g., Kisii" {...field} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="population_estimate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Population Served</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 45000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Scheme'}
        </Button>
      </form>
    </Form>
  );
}
