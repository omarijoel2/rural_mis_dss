import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const telemetrySchema = z.object({
  tag: z.string().min(1, 'Tag name required').regex(/^[A-Z_0-9]+$/, 'Use uppercase and underscores'),
  ioType: z.enum(['AI', 'DI', 'AO', 'DO']),
  unit: z.string().optional(),
  assetId: z.string().optional(),
  scale: z.string().optional(),
  thresholds: z.string().optional(),
});

type TelemetryFormData = z.infer<typeof telemetrySchema>;

interface TelemetryTagFormProps {
  onSubmit: (data: TelemetryFormData) => Promise<void>;
  defaultValues?: Partial<TelemetryFormData>;
  isLoading?: boolean;
  assetOptions?: Array<{ id: number; name: string; code: string }>;
}

export function TelemetryTagForm({ onSubmit, defaultValues, isLoading, assetOptions = [] }: TelemetryTagFormProps) {
  const form = useForm<TelemetryFormData>({
    resolver: zodResolver(telemetrySchema),
    defaultValues: {
      tag: '',
      ioType: 'AI',
      unit: '',
      assetId: '',
      scale: '',
      thresholds: '',
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PUMP_001_FLOW" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ioType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I/O Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'AI'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AI">Analog Input</SelectItem>
                    <SelectItem value="DI">Digital Input</SelectItem>
                    <SelectItem value="AO">Analog Output</SelectItem>
                    <SelectItem value="DO">Digital Output</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., lpm, bar, °C, m3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {assetOptions?.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.name} ({a.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="scale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scale (JSON)</FormLabel>
              <FormControl>
                <Textarea placeholder='{"min": 0, "max": 500, "offset": 0}' className="h-20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thresholds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thresholds (JSON)</FormLabel>
              <FormControl>
                <Textarea placeholder='{"critical_low": 10, "warning_low": 50, "warning_high": 450, "critical_high": 490}' className="h-24" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Telemetry Tag'}
        </Button>
      </form>
    </Form>
  );
}
