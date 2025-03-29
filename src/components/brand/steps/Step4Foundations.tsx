
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

interface Step4FoundationsProps {
  form: UseFormReturn<BrandIdentityFormValues>;
}

const Step4Foundations: React.FC<Step4FoundationsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Brand Foundations</h2>
      
      <FormField
        control={form.control}
        name="brandStory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Story</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell your brand's story..." 
                className="bg-gray-800 border-gray-700 text-white resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vision"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vision</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What's your brand's vision for the future?" 
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
        name="mission"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mission</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What's your brand's mission?" 
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
        name="coreValues"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Core Values</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What are your brand's core values?" 
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

export default Step4Foundations;
