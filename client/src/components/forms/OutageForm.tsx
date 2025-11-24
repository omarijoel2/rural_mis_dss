import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const outageSchema = z.object({
  schemeId: z.string().min(1, 'Scheme required'),
  cause: z.enum(['planned', 'fault', 'water_quality', 'power', 'other']),
  reason: z.string().min(1, 'Reason required'),
  scheduledStart: z.string().min(1, 'Start date required'),
  scheduledEnd: z.string().min(1, 'End date required'),
  estimatedAffectedPopulation: z.string().optional(),
  notes: z.string().optional(),
});

type OutageFormData = z.infer<typeof outageSchema>;

interface OutageFormProps {
  onSubmit: (data: OutageFormData) => Promise<void>;
  defaultValues?: Partial<OutageFormData>;
  isLoading?: boolean;
  schemeOptions?: Array<{ id: number; name: string }>;
}

export function OutageForm({ onSubmit, defaultValues, isLoading, schemeOptions = [] }: OutageFormProps) {
  const form = useForm<OutageFormData>({
    resolver: zodResolver(outageSchema),
    defaultValues: defaultValues || {},
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="schemeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Scheme</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scheme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {schemeOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cause"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cause</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cause" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planned">Planned Maintenance</SelectItem>
                    <SelectItem value="fault">Equipment Fault</SelectItem>
                    <SelectItem value="water_quality">Water Quality Issue</SelectItem>
                    <SelectItem value="power">Power Outage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Annual pump maintenance and system cleaning" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Start</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scheduledEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled End</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estimatedAffectedPopulation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Affected Population</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 25000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional information for staff..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Planning Outage...' : 'Plan Outage'}
        </Button>
      </form>
    </Form>
  );
}
