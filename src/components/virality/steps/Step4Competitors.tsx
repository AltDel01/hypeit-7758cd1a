
import React, { useState } from 'react';
import { Competitor } from '@/hooks/useViralityStrategyForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Step4CompetitorsProps {
  competitors: Competitor[];
  updateCompetitors: (competitors: Competitor[]) => void;
}

const Step4Competitors: React.FC<Step4CompetitorsProps> = ({
  competitors,
  updateCompetitors
}) => {
  const handleCompetitorChange = (index: number, key: keyof Competitor, value: string) => {
    const updatedCompetitors = [...competitors];
    updatedCompetitors[index] = {
      ...updatedCompetitors[index],
      [key]: value
    };
    updateCompetitors(updatedCompetitors);
  };

  const addCompetitor = () => {
    updateCompetitors([
      ...competitors,
      {
        name: '',
        socialFollowers: '',
        postFrequency: '',
        contentThemes: '',
        contentTypes: '',
        visualStyle: '',
        interaction: '',
        communityBuilding: '',
        feedback: '',
        strengths: '',
        weaknesses: ''
      }
    ]);
  };

  const removeCompetitor = (index: number) => {
    const updatedCompetitors = [...competitors];
    updatedCompetitors.splice(index, 1);
    updateCompetitors(updatedCompetitors);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Competitor Analysis</h2>
      <p className="text-gray-400 mb-6">
        Analyze your competitors to identify opportunities and differentiate your strategy.
      </p>
      
      <Accordion type="multiple" className="w-full space-y-4">
        {competitors.map((competitor, index) => (
          <AccordionItem 
            key={index} 
            value={`competitor-${index}`}
            className="border border-gray-700 rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 bg-gray-800 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between w-full px-2">
                <span>
                  {competitor.name ? competitor.name : `Competitor ${index + 1}`}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-red-400 hover:text-red-300 hover:bg-red-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCompetitor(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 bg-gray-900">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`competitor-${index}-name`}>Competitor Name</Label>
                  <Input
                    id={`competitor-${index}-name`}
                    value={competitor.name}
                    onChange={(e) => handleCompetitorChange(index, 'name', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="Enter competitor name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`competitor-${index}-followers`}>Social Media Follower Count</Label>
                  <Input
                    id={`competitor-${index}-followers`}
                    value={competitor.socialFollowers}
                    onChange={(e) => handleCompetitorChange(index, 'socialFollowers', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="e.g., Instagram: 10K, TikTok: 50K"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-white mt-6">Content Strategy</h3>
                
                <div>
                  <Label htmlFor={`competitor-${index}-frequency`}>Post Frequency</Label>
                  <Input
                    id={`competitor-${index}-frequency`}
                    value={competitor.postFrequency}
                    onChange={(e) => handleCompetitorChange(index, 'postFrequency', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="e.g., daily, weekly, sporadically"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`competitor-${index}-themes`}>Content Themes</Label>
                  <Input
                    id={`competitor-${index}-themes`}
                    value={competitor.contentThemes}
                    onChange={(e) => handleCompetitorChange(index, 'contentThemes', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="e.g., product showcases, behind the scenes, testimonials"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`competitor-${index}-types`}>Content Types</Label>
                  <Input
                    id={`competitor-${index}-types`}
                    value={competitor.contentTypes}
                    onChange={(e) => handleCompetitorChange(index, 'contentTypes', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="e.g., videos, images, blog posts, stories"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`competitor-${index}-style`}>Visual and Brand Style</Label>
                  <Input
                    id={`competitor-${index}-style`}
                    value={competitor.visualStyle}
                    onChange={(e) => handleCompetitorChange(index, 'visualStyle', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="e.g., color schemes, tone of voice, imagery"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-white mt-6">Engagement Strategy</h3>
                
                <div>
                  <Label htmlFor={`competitor-${index}-interaction`}>Interaction with followers</Label>
                  <Textarea
                    id={`competitor-${index}-interaction`}
                    value={competitor.interaction}
                    onChange={(e) => handleCompetitorChange(index, 'interaction', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
                    placeholder="e.g., responding to comments, hosting Q&A sessions, user-generated content"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`competitor-${index}-community`}>Community Building</Label>
                  <Textarea
                    id={`competitor-${index}-community`}
                    value={competitor.communityBuilding}
                    onChange={(e) => handleCompetitorChange(index, 'communityBuilding', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
                    placeholder="Do they foster a strong community around their brand?"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`competitor-${index}-feedback`}>Customer Feedback</Label>
                  <Textarea
                    id={`competitor-${index}-feedback`}
                    value={competitor.feedback}
                    onChange={(e) => handleCompetitorChange(index, 'feedback', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
                    placeholder="Positive, negative, neutral feedback and how they address it"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-white mt-6">Analysis</h3>
                
                <div>
                  <Label htmlFor={`competitor-${index}-strengths`}>Strengths</Label>
                  <Textarea
                    id={`competitor-${index}-strengths`}
                    value={competitor.strengths}
                    onChange={(e) => handleCompetitorChange(index, 'strengths', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
                    placeholder="What do they do well? What's their unique selling point?"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`competitor-${index}-weaknesses`}>Weaknesses</Label>
                  <Textarea
                    id={`competitor-${index}-weaknesses`}
                    value={competitor.weaknesses}
                    onChange={(e) => handleCompetitorChange(index, 'weaknesses', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[80px]"
                    placeholder="Areas for improvement and missed opportunities"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={addCompetitor}
        className="mt-4 border-gray-700 text-white w-full"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Competitor
      </Button>
    </div>
  );
};

export default Step4Competitors;
