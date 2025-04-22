import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Linkedin, Calendar, BarChart, Users, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PremiumFeatureModal from '@/components/pricing/PremiumFeatureModal';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { user } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [activePremiumFeature, setActivePremiumFeature] = useState('');
  const navigate = useNavigate();

  const handlePremiumFeature = (feature: string) => {
    if (!user) {
      localStorage.setItem('authRedirectPath', '/analytics');
      navigate('/login');
      return;
    }
    
    setActivePremiumFeature(feature);
    setIsPremiumModalOpen(true);
  };

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Analytics Dashboard</h1>
          
          <Tabs defaultValue="connect" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="bg-gray-800 p-1 mb-6 flex flex-nowrap">
                <TabsTrigger value="connect" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4" />
                    <span className="hidden md:inline">Connect Accounts</span>
                    <span className="md:hidden">Connect</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden md:inline">Schedule Posts</span>
                    <span className="md:hidden">Schedule</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden md:inline">Content Analysis</span>
                    <span className="md:hidden">Analysis</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="influencers" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline">Influencer Analytics</span>
                    <span className="md:hidden">Influencers</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="outreach" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="hidden md:inline">Influencer Outreach</span>
                    <span className="md:hidden">Outreach</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="mr-2">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="hidden md:inline">X</span>
                    <span className="md:hidden">X</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="tiktok" className="data-[state=active]:bg-[#7a45e6]">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.589 6.686C19.5002 6.67221 19.4133 6.65041 19.33 6.621C18.1713 6.271 17.157 5.5945 16.4144 4.6715C15.6719 3.7486 15.2385 2.62708 15.179 1.456H11.334V15.989C11.334 16.2551 11.2815 16.5181 11.1798 16.7622C11.0781 17.0063 10.9295 17.226 10.7428 17.4081C10.556 17.5901 10.3345 17.7309 10.0885 17.824C9.8426 17.9172 9.5786 17.9605 9.31399 17.951C8.77355 17.9516 8.25353 17.7624 7.84719 17.4175C7.44085 17.0727 7.17543 16.5969 7.10199 16.072C7.02855 15.547 7.15266 15.0156 7.45244 14.5794C7.75222 14.1431 8.20769 13.8306 8.73499 13.703C8.83098 13.6787 8.93005 13.6661 9.02999 13.666V9.866C8.45899 9.866 7.89399 9.978 7.35899 10.19C6.42819 10.5649 5.63768 11.221 5.09454 12.0662C4.55139 12.9114 4.28024 13.9057 4.31999 14.916C4.35974 15.9263 4.70859 16.8994 5.3149 17.7023C5.92121 18.5052 6.75829 19.0998 7.71299 19.412C8.35399 19.623 9.01999 19.727 9.68399 19.727C10.3533 19.7269 11.0162 19.6126 11.643 19.3899C12.8571 18.9231 13.8609 18.0525 14.4767 16.929C15.0926 15.8055 15.2799 14.5022 15.004 13.26V7.636C15.8167 8.11371 16.7041 8.45697 17.632 8.65C18.1294 8.748 18.6348 8.81218 19.144 8.842V5.571C19.34 5.678 19.488 5.757 19.589 5.814V6.686Z" fill="currentColor"/>
                  </svg>
                  <span className="hidden md:inline">TikTok</span>
                  <span className="md:hidden">TikTok</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Connect Social Accounts Tab */}
          <TabsContent value="connect" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SocialConnectCard 
                platform="Instagram" 
                icon={<Instagram className="h-8 w-8 text-pink-500" />} 
                onConnect={() => handlePremiumFeature('instagram')}
              />
              <SocialConnectCard 
                platform="LinkedIn" 
                icon={<Linkedin className="h-8 w-8 text-blue-700" />} 
                onConnect={() => handlePremiumFeature('linkedin')}
              />
              <SocialConnectCard 
                platform="X" 
                icon={
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" className="text-white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                } 
                onConnect={() => handlePremiumFeature('x')}
              />
              <SocialConnectCard 
                platform="TikTok" 
                icon={
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.589 6.686C19.5002 6.67221 19.4133 6.65041 19.33 6.621C18.1713 6.271 17.157 5.5945 16.4144 4.6715C15.6719 3.7486 15.2385 2.62708 15.179 1.456H11.334V15.989C11.334 16.2551 11.2815 16.5181 11.1798 16.7622C11.0781 17.0063 10.9295 17.226 10.7428 17.4081C10.556 17.5901 10.3345 17.7309 10.0885 17.824C9.8426 17.9172 9.5786 17.9605 9.31399 17.951C8.77355 17.9516 8.25353 17.7624 7.84719 17.4175C7.44085 17.0727 7.17543 16.5969 7.10199 16.072C7.02855 15.547 7.15266 15.0156 7.45244 14.5794C7.75222 14.1431 8.20769 13.8306 8.73499 13.703C8.83098 13.6787 8.93005 13.6661 9.02999 13.666V9.866C8.45899 9.866 7.89399 9.978 7.35899 10.19C6.42819 10.5649 5.63768 11.221 5.09454 12.0662C4.55139 12.9114 4.28024 13.9057 4.31999 14.916C4.35974 15.9263 4.70859 16.8994 5.3149 17.7023C5.92121 18.5052 6.75829 19.0998 7.71299 19.412C8.35399 19.623 9.01999 19.727 9.68399 19.727C10.3533 19.7269 11.0162 19.6126 11.643 19.3899C12.8571 18.9231 13.8609 18.0525 14.4767 16.929C15.0926 15.8055 15.2799 14.5022 15.004 13.26V7.636C15.8167 8.11371 16.7041 8.45697 17.632 8.65C18.1294 8.748 18.6348 8.81218 19.144 8.842V5.571C19.34 5.678 19.488 5.757 19.589 5.814V6.686Z" fill="currentColor"/>
                  </svg>
                } 
                onConnect={() => handlePremiumFeature('tiktok')}
              />
            </div>
          </TabsContent>
          
          {/* Schedule Posts Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Schedule and Automate Posts</h2>
              <p className="text-gray-300 mb-6">Plan your content calendar and automatically post to connected social media accounts at optimal times.</p>
              <Button 
                className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
                onClick={() => handlePremiumFeature('schedule')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Set Up Content Calendar
              </Button>
            </Card>
          </TabsContent>
          
          {/* Content Analysis Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Content Performance Analytics</h2>
              <p className="text-gray-300 mb-6">Analyze engagement metrics across all platforms. See what content performs best and get AI recommendations for improvement.</p>
              <Button 
                className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
                onClick={() => handlePremiumFeature('content')}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Analyze Content Performance
              </Button>
            </Card>
          </TabsContent>
          
          {/* Influencer Analytics Tab */}
          <TabsContent value="influencers" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Influencer Recommendations</h2>
              <p className="text-gray-300 mb-6">Get AI-powered recommendations for influencers that match your brand identity and target audience.</p>
              <Button 
                className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
                onClick={() => handlePremiumFeature('influencers')}
              >
                <Users className="mr-2 h-4 w-4" />
                Find Matching Influencers
              </Button>
            </Card>
          </TabsContent>
          
          {/* Influencer Outreach Tab */}
          <TabsContent value="outreach" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Influencer Outreach</h2>
              <p className="text-gray-300 mb-6">Contact suitable influencers, collect rate cards, and generate briefs with AI assistance.</p>
              <Button 
                className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white"
                onClick={() => handlePremiumFeature('outreach')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Start Outreach Campaign
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <PremiumFeatureModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        feature={activePremiumFeature}
      />
    </AuroraBackground>
  );
};

interface SocialConnectCardProps {
  platform: string;
  icon: React.ReactNode;
  onConnect: () => void;
}

const SocialConnectCard = ({ platform, icon, onConnect }: SocialConnectCardProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700 p-6 flex flex-col items-center text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{platform}</h3>
      <p className="text-gray-400 text-sm mb-4">Connect your {platform} account to analyze performance and schedule posts.</p>
      <Button 
        className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white mt-auto w-full"
        onClick={onConnect}
      >
        Connect {platform}
      </Button>
    </Card>
  );
};

export default Analytics;
