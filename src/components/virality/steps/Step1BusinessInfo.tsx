
import React from 'react';
import { BusinessInfo } from '@/hooks/useViralityStrategyForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Step1BusinessInfoProps {
  businessInfo: BusinessInfo;
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void;
}

const Step1BusinessInfo: React.FC<Step1BusinessInfoProps> = ({
  businessInfo,
  updateBusinessInfo
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateBusinessInfo({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">About Your Business</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            name="businessName"
            value={businessInfo.businessName}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="Enter your business name"
          />
        </div>
        
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            name="tagline"
            value={businessInfo.tagline}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="Enter your business tagline"
          />
        </div>
        
        <div>
          <Label htmlFor="summary">Brief Summary of What You Sell</Label>
          <Textarea
            id="summary"
            name="summary"
            value={businessInfo.summary}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
            placeholder="Describe your products or services"
          />
        </div>
        
        <div>
          <Label htmlFor="keyValues">Key Values & What You Aim to Solve</Label>
          <Textarea
            id="keyValues"
            name="keyValues"
            value={businessInfo.keyValues}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
            placeholder="Describe your brand's key values and what problems you aim to solve"
          />
        </div>
        
        <div>
          <Label htmlFor="brandStory">Brand Story</Label>
          <Textarea
            id="brandStory"
            name="brandStory"
            value={businessInfo.brandStory}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[100px]"
            placeholder="How was your brand founded and what has its journey been like?"
          />
        </div>
        
        <div>
          <Label htmlFor="businessGoals">Business Goals</Label>
          <Textarea
            id="businessGoals"
            name="businessGoals"
            value={businessInfo.businessGoals}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
            placeholder="What are your main business goals?"
          />
        </div>
        
        <div>
          <Label htmlFor="brandSlogan">Brand Slogan</Label>
          <Input
            id="brandSlogan"
            name="brandSlogan"
            value={businessInfo.brandSlogan}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="Enter your brand slogan"
          />
        </div>
        
        <div>
          <Label htmlFor="uniqueSellingPoint">Unique Selling Point</Label>
          <Textarea
            id="uniqueSellingPoint"
            name="uniqueSellingPoint"
            value={businessInfo.uniqueSellingPoint}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
            placeholder="What distinguishes your product from competitors?"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1BusinessInfo;
