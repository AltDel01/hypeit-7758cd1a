
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';

export interface ActivityItem {
  type: 'image' | 'text' | 'moodboard';
  title: string;
  time: string;
  preview: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        <Button variant="link" className="text-[#8c52ff] p-0 h-auto">
          View All
        </Button>
      </div>
      <GlassMorphismCard className="overflow-hidden bg-gray-900/50 border-gray-700">
        <div className="divide-y divide-gray-800">
          {activities.map((activity, idx) => (
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
  );
};

export default RecentActivity;
