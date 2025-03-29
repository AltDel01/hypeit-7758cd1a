
import React from 'react';
import { ContentPillar } from '@/hooks/useViralityStrategyForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Step5ContentPillarsProps {
  contentPillars: ContentPillar[];
  updateContentPillars: (pillars: ContentPillar[]) => void;
}

const Step5ContentPillars: React.FC<Step5ContentPillarsProps> = ({
  contentPillars,
  updateContentPillars
}) => {
  const handlePillarNameChange = (index: number, name: string) => {
    const updatedPillars = [...contentPillars];
    updatedPillars[index] = {
      ...updatedPillars[index],
      name
    };
    updateContentPillars(updatedPillars);
  };

  const handleContentIdeaChange = (pillarIndex: number, ideaIndex: number, idea: string) => {
    const updatedPillars = [...contentPillars];
    updatedPillars[pillarIndex] = {
      ...updatedPillars[pillarIndex],
      contentIdeas: updatedPillars[pillarIndex].contentIdeas.map((existingIdea, i) => 
        i === ideaIndex ? idea : existingIdea
      )
    };
    updateContentPillars(updatedPillars);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Content Pillars</h2>
      <p className="text-gray-400 mb-6">
        Define 3 content pillars and 3 content ideas for each pillar.
      </p>
      
      <Tabs defaultValue="pillar1" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-700 rounded-md p-1 grid grid-cols-3 h-auto">
          <TabsTrigger value="pillar1" className="data-[state=active]:bg-blue-600">Pillar 1</TabsTrigger>
          <TabsTrigger value="pillar2" className="data-[state=active]:bg-blue-600">Pillar 2</TabsTrigger>
          <TabsTrigger value="pillar3" className="data-[state=active]:bg-blue-600">Pillar 3</TabsTrigger>
        </TabsList>
        
        {contentPillars.map((pillar, pillarIndex) => (
          <TabsContent key={pillarIndex} value={`pillar${pillarIndex + 1}`} className="mt-6 space-y-6">
            <div>
              <Label htmlFor={`pillar-${pillarIndex}-name`}>Content Pillar Name</Label>
              <Input
                id={`pillar-${pillarIndex}-name`}
                value={pillar.name}
                onChange={(e) => handlePillarNameChange(pillarIndex, e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder={`Name for Content Pillar ${pillarIndex + 1}`}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Content Ideas</h3>
              
              {pillar.contentIdeas.map((idea, ideaIndex) => (
                <div key={ideaIndex}>
                  <Label htmlFor={`pillar-${pillarIndex}-idea-${ideaIndex}`}>
                    Content Idea {ideaIndex + 1}
                  </Label>
                  <Input
                    id={`pillar-${pillarIndex}-idea-${ideaIndex}`}
                    value={idea}
                    onChange={(e) => handleContentIdeaChange(pillarIndex, ideaIndex, e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder={`Content idea ${ideaIndex + 1} for ${pillar.name || `Pillar ${pillarIndex + 1}`}`}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Step5ContentPillars;
