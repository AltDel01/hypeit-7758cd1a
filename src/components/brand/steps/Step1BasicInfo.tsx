
import React from 'react';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import FontSelector from '@/components/brand/FontSelector';
import { UseFormReturn } from 'react-hook-form';
import { BrandIdentityFormValues } from '@/types/brand';

interface Step1BasicInfoProps {
  form: UseFormReturn<BrandIdentityFormValues>;
  selectedFont: string;
  onSelectFont: (font: string) => void;
}

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ 
  form, 
  selectedFont, 
  onSelectFont 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-white">Business Information</h2>
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Business Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your business name" 
                {...field} 
                className="bg-gray-800 border-gray-700 text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="mt-6">
        <FormLabel className="block mb-2 text-white">Select Font</FormLabel>
        <FontSelector
          selectedFont={selectedFont}
          onSelectFont={onSelectFont}
        />
      </div>
    </div>
  );
};

export default Step1BasicInfo;
