
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart, Users, Mail } from 'lucide-react';

interface Props {
  onTrigger: (feature: string) => void;
}
const FeatureTabContent = ({ onTrigger }: Props) => (
  <>
    <TabsContent value="schedule" className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Schedule and Automate Posts</h2>
        <p className="text-gray-300 mb-6">Plan your content calendar and automatically post to connected social media accounts at optimal times.</p>
        <Button
          className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
          onClick={() => onTrigger('schedule')}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Set Up Content Calendar
        </Button>
      </Card>
    </TabsContent>
    <TabsContent value="content" className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Content Performance Analytics</h2>
        <p className="text-gray-300 mb-6">Analyze engagement metrics across all platforms. See what content performs best and get AI recommendations for improvement.</p>
        <Button
          className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
          onClick={() => onTrigger('content')}
        >
          <BarChart className="mr-2 h-4 w-4" />
          Analyze Content Performance
        </Button>
      </Card>
    </TabsContent>
    <TabsContent value="influencers" className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Influencer Recommendations</h2>
        <p className="text-gray-300 mb-6">Get AI-powered recommendations for influencers that match your brand identity and target audience.</p>
        <Button
          className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
          onClick={() => onTrigger('influencers')}
        >
          <Users className="mr-2 h-4 w-4" />
          Find Matching Influencers
        </Button>
      </Card>
    </TabsContent>
    <TabsContent value="outreach" className="space-y-4">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Influencer Outreach</h2>
        <p className="text-gray-300 mb-6">Contact suitable influencers, collect rate cards, and generate briefs with AI assistance.</p>
        <Button
          className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
          onClick={() => onTrigger('outreach')}
        >
          <Mail className="mr-2 h-4 w-4" />
          Start Outreach Campaign
        </Button>
      </Card>
    </TabsContent>
  </>
);
import { TabsContent } from '@/components/ui/tabs';
export default FeatureTabContent;
