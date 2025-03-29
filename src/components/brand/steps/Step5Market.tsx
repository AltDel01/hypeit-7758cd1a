
import React from 'react';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { BrandIdentityFormValues } from '@/types/brand';

interface Step5MarketProps {
  form: UseFormReturn<BrandIdentityFormValues>;
}

const Step5Market: React.FC<Step5MarketProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Market & Audience</h2>
      
      <FormField
        control={form.control}
        name="coreServices"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Core Services or Products</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What are your main services or products?" 
                className="bg-gray-800 border-gray-700 text-white resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="audience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Audience</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your target audience..." 
                className="bg-gray-800 border-gray-700 text-white resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="market"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Market</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your market..." 
                className="bg-gray-800 border-gray-700 text-white resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="goals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Goals</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What are your brand's goals?" 
                className="bg-gray-800 border-gray-700 text-white resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Step5Market;
