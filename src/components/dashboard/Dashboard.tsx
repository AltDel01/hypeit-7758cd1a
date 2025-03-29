
import React from 'react';
import { cn } from '@/lib/utils';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  BarChart3,
  Clock,
  Plus
} from 'lucide-react';

interface UsageMetric {
  label: string;
  current: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}

const Dashboard = () => {
  // Mock data for usage metrics
  const usageMetrics: UsageMetric[] = [
    {
      label: "AI Images",
      current: 3,
      total: 5,
      icon: <Image className="h-5 w-5" />,
      color: "from-blue-500 to-cyan-400"
    },
    {
      label: "Text Content",
      current: 7,
      total: 10,
      icon: <MessageSquare className="h-5 w-5" />,
      color: "from-violet-500 to-purple-400"
    },
    {
      label: "Moodboards",
      current: 1,
      total: 1,
      icon: <FileText className="h-5 w-5" />,
      color: "from-amber-500 to-orange-400"
    }
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      type: "image",
      title: "Instagram Post",
      time: "2 hours ago",
      preview: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    },
    {
      type: "text",
      title: "Twitter Caption",
      time: "Yesterday",
      preview: "Introducing our latest product - designed with you in mind. #innovation #design"
    },
    {
      type: "moodboard",
      title: "Brand Moodboard",
      time: "3 days ago",
      preview: "https://images.unsplash.com/photo-1542621334-a254cf47733d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's an overview of your BrandGen activity.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
            <Clock className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button className="bg-[#8c52ff] hover:bg-[#7a45e6] text-white hover:shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            New Creation
          </Button>
        </div>
      </div>
      
      {/* Usage Metrics */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Usage This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usageMetrics.map((metric, idx) => (
            <GlassMorphismCard key={idx} className="p-4 bg-gray-900/50 border-gray-700">
              <div className="flex items-start">
                <div className={cn(
                  "flex items-center justify-center rounded-md p-2 mr-3",
                  `bg-gradient-to-br ${metric.color} text-white`
                )}>
                  {metric.icon}
                </div>
                <div>
                  <h3 className="font-medium text-white">{metric.label}</h3>
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">
                        {metric.current} of {metric.total} used
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((metric.current / metric.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          `bg-gradient-to-r ${metric.color}`
                        )}
                        style={{ width: `${(metric.current / metric.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassMorphismCard>
          ))}
        </div>
      </section>
      
      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Create Something New</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard 
            title="Generate Images" 
            description="Create social media visuals"
            icon={<Image className="h-5 w-5 text-blue-500" />}
            onClick={() => console.log("Navigate to image generation")}
          />
          <ActionCard 
            title="Write Captions" 
            description="Craft engaging social media text"
            icon={<MessageSquare className="h-5 w-5 text-[#8c52ff]" />}
            onClick={() => console.log("Navigate to text generation")}
          />
          <ActionCard 
            title="Build Moodboard" 
            description="Design your brand identity"
            icon={<FileText className="h-5 w-5 text-amber-500" />}
            onClick={() => console.log("Navigate to moodboard creation")}
          />
          <ActionCard 
            title="Create Strategy" 
            description="Plan your social media approach"
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            onClick={() => console.log("Navigate to strategy creation")}
            disabled={true}
            upgradeBadge={true}
          />
        </div>
      </section>
      
      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <Button variant="link" className="text-[#8c52ff] p-0 h-auto">
            View All
          </Button>
        </div>
        <GlassMorphismCard className="overflow-hidden bg-gray-900/50 border-gray-700">
          <div className="divide-y divide-gray-800">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center p-4 hover:bg-gray-800/50 transition-colors">
                <div className="mr-4">
                  {activity.type === "image" || activity.type === "moodboard" ? (
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <img 
                        src={activity.preview} 
                        alt={activity.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center rounded-md bg-gray-800 text-gray-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{activity.title}</h3>
                  <p className="text-sm text-gray-400">{activity.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  View
                </Button>
              </div>
            ))}
          </div>
        </GlassMorphismCard>
      </section>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  upgradeBadge?: boolean;
}

const ActionCard = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  upgradeBadge = false
}: ActionCardProps) => {
  return (
    <GlassMorphismCard 
      className={cn(
        "p-4 hover:cursor-pointer transition-all duration-300 bg-gray-900/50 border-gray-700",
        disabled ? "opacity-80" : "hover:-translate-y-1"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start">
        <div className="flex items-center justify-center rounded-md p-2 mr-3 bg-gray-800">
          {icon}
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-white">{title}</h3>
            {upgradeBadge && (
              <span className="ml-2 text-xs bg-[#8c52ff]/10 text-[#8c52ff] px-2 py-0.5 rounded-full">
                Pro
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </GlassMorphismCard>
  );
};

export default Dashboard;
