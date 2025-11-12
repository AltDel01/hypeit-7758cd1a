
import { UsageMetric } from '../UsageMetrics';
import { ActivityItem } from '../RecentActivity';
import { Image, MessageSquare, FileText } from 'lucide-react';
import React from 'react';

// Mock data for usage metrics
export const getUsageMetrics = (): UsageMetric[] => [
  {
    label: "AI Images",
    current: 3,
    total: 5,
    icon: React.createElement(Image, { className: "h-5 w-5" }),
    color: "from-blue-500 to-cyan-400"
  },
  {
    label: "Text Content",
    current: 7,
    total: 10,
    icon: React.createElement(MessageSquare, { className: "h-5 w-5" }),
    color: "from-violet-500 to-purple-400"
  },
  {
    label: "Moodboards",
    current: 1,
    total: 1,
    icon: React.createElement(FileText, { className: "h-5 w-5" }),
    color: "from-amber-500 to-orange-400"
  }
];

// Mock data for recent activity
export const getRecentActivity = (): ActivityItem[] => [
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
