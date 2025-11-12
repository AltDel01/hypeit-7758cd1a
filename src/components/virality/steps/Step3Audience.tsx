
import React from 'react';
import { Audience } from '@/hooks/useViralityStrategyForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Step3AudienceProps {
  audience: Audience;
  updateAudience: (audience: Partial<Audience>) => void;
}

const Step3Audience: React.FC<Step3AudienceProps> = ({
  audience,
  updateAudience
}) => {
  const handlePrimaryDemographicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAudience({
      primary: {
        ...audience.primary,
        demographic: {
          ...audience.primary.demographic,
          [name]: value
        }
      }
    });
  };

  const handlePrimaryInterestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAudience({
      primary: {
        ...audience.primary,
        interest: {
          ...audience.primary.interest,
          [name]: value
        }
      }
    });
  };

  const handlePrimaryBehaviorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAudience({
      primary: {
        ...audience.primary,
        behavior: {
          ...audience.primary.behavior,
          [name]: value
        }
      }
    });
  };

  const handleSecondaryDemographicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAudience({
      secondary: {
        ...audience.secondary,
        demographic: {
          ...audience.secondary.demographic,
          [name]: value
        }
      }
    });
  };

  const handleSecondaryInterestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAudience({
      secondary: {
        ...audience.secondary,
        interest: {
          ...audience.secondary.interest,
          [name]: value
        }
      }
    });
  };

  const handleSecondaryBehaviorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAudience({
      secondary: {
        ...audience.secondary,
        behavior: {
          ...audience.secondary.behavior,
          [name]: value
        }
      }
    });
  };

  const renderDemographicFields = (
    demographic: Audience['primary']['demographic'], 
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-2">Demographics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ageRange">Age Range</Label>
          <Input
            id="ageRange"
            name="ageRange"
            value={demographic.ageRange}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="e.g., 25-34"
          />
        </div>
        
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Input
            id="gender"
            name="gender"
            value={demographic.gender}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="e.g., All, Female, Male, Non-binary"
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={demographic.location}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="e.g., United States, Global, Urban areas"
          />
        </div>
        
        <div>
          <Label htmlFor="income">Income Level</Label>
          <Input
            id="income"
            name="income"
            value={demographic.income}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="e.g., Middle-income, Affluent"
          />
        </div>
        
        <div>
          <Label htmlFor="education">Education Level</Label>
          <Input
            id="education"
            name="education"
            value={demographic.education}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="e.g., College graduates, High school"
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            name="status"
            value={demographic.status}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700 text-white mt-1"
            placeholder="e.g., Married, Single, Parents"
          />
        </div>
      </div>
    </div>
  );

  const renderInterestFields = (
    interest: Audience['primary']['interest'], 
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  ) => (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-white mb-2">Interests</h3>
      
      <div>
        <Label htmlFor="hobbies">Interests & Hobbies</Label>
        <Textarea
          id="hobbies"
          name="hobbies"
          value={interest.hobbies}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
          placeholder="What interests and hobbies do they have?"
        />
      </div>
      
      <div>
        <Label htmlFor="values">Values & Benefits</Label>
        <Textarea
          id="values"
          name="values"
          onChange={handleChange}
          value={interest.values}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
          placeholder="What values and benefits do they seek?"
        />
      </div>
      
      <div>
        <Label htmlFor="lifestyle">Lifestyle Choices</Label>
        <Textarea
          id="lifestyle"
          name="lifestyle"
          value={interest.lifestyle}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
          placeholder="e.g., Health-conscious, tech-savvy, environmentally aware"
        />
      </div>
      
      <div>
        <Label htmlFor="painPoints">Pain Points</Label>
        <Textarea
          id="painPoints"
          name="painPoints"
          value={interest.painPoints}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
          placeholder="What problems or challenges do they face?"
        />
      </div>
    </div>
  );

  const renderBehaviorFields = (
    behavior: Audience['primary']['behavior'], 
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  ) => (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-white mb-2">Behavior</h3>
      
      <div>
        <Label htmlFor="onlineBehavior">Online Behavior</Label>
        <Textarea
          id="onlineBehavior"
          name="onlineBehavior"
          value={behavior.onlineBehavior}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
          placeholder="Which platforms do they use? When are they most active?"
        />
      </div>
      
      <div>
        <Label htmlFor="purchaseBehavior">Purchase Behavior</Label>
        <Textarea
          id="purchaseBehavior"
          name="purchaseBehavior"
          value={behavior.purchaseBehavior}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
          placeholder="Frequency of purchases, decision-making process, brand loyalty"
        />
      </div>
      
      <div>
        <Label htmlFor="contentPreferences">Content Preferences</Label>
        <Textarea
          id="contentPreferences"
          name="contentPreferences"
          value={behavior.contentPreferences}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
          placeholder="What type of content do they prefer to consume?"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Audience Targeting</h2>
      <p className="text-gray-400 mb-6">
        Define your primary and secondary audiences in detail.
      </p>
      
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-700 rounded-md p-1 grid grid-cols-2 h-auto">
          <TabsTrigger value="primary" className="data-[state=active]:bg-blue-600">Primary Audience</TabsTrigger>
          <TabsTrigger value="secondary" className="data-[state=active]:bg-blue-600">Secondary Audience</TabsTrigger>
        </TabsList>
        
        <TabsContent value="primary" className="mt-6 space-y-6">
          {renderDemographicFields(audience.primary.demographic, handlePrimaryDemographicChange)}
          {renderInterestFields(audience.primary.interest, handlePrimaryInterestChange)}
          {renderBehaviorFields(audience.primary.behavior, handlePrimaryBehaviorChange)}
        </TabsContent>
        
        <TabsContent value="secondary" className="mt-6 space-y-6">
          {renderDemographicFields(audience.secondary.demographic, handleSecondaryDemographicChange)}
          {renderInterestFields(audience.secondary.interest, handleSecondaryInterestChange)}
          {renderBehaviorFields(audience.secondary.behavior, handleSecondaryBehaviorChange)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Step3Audience;
