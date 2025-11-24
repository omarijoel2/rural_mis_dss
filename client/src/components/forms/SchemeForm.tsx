import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schemeSchema = z.object({
  code: z.string().min(1, 'Code required'),
  name: z.string().min(1, 'Name required'),
  type: z.enum(['piped', 'handpump', 'borehole', 'spring']),
  ownership: z.enum(['public', 'private', 'community']),
  county: z.string().optional(),
  populationServed: z.string().optional().transform(v => v ? parseInt(v) : undefined),
});

type SchemeFormData = z.infer<typeof schemeSchema>;

interface SchemeFormProps {
  onSubmit: (data: SchemeFormData) => Promise<void>;
  defaultValues?: Partial<SchemeFormData>;
  isLoading?: boolean;
}

export function SchemeForm({ onSubmit, defaultValues, isLoading }: SchemeFormProps) {
  const form = useForm<SchemeFormData>({
    resolver: zodResolver(schemeSchema),
    defaultValues: defaultValues || {},
  });

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
                <Input placeholder="e.g., KISII_001" {...field} />
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
                <Input placeholder="e.g., Kisii Urban Scheme" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="piped">Piped</SelectItem>
                  <SelectItem value="handpump">Hand Pump</SelectItem>
                  <SelectItem value="borehole">Borehole</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ownership"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ownership</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ownership" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
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
