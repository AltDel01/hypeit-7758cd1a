
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KeyMetrics from './components/KeyMetrics';
import UserPerformance from './components/UserPerformance';
import UserAuthenticity from './components/UserAuthenticity';
import SignificantFollowers from './components/SignificantFollowers';
import FollowersReachability from './components/FollowersReachability';
import ProfileGrowth from './components/ProfileGrowth';
import ContentBreakdown from './components/ContentBreakdown';
import HashtagPerformance from './components/HashtagPerformance';
import RecentContent from './components/RecentContent';
import TopHashtags from './components/TopHashtags';

interface InstagramAnalyticsDashboardProps {
  username: string;
}

const InstagramAnalyticsDashboard: React.FC<InstagramAnalyticsDashboardProps> = ({ username }) => {
  // Mock data based on the reference image
  const profileData = {
    username: username,
    followers: '5,646',
    following: '115',
    engagement: '58.9%',
    reach: '3,326',
    impressions: '35.8%',
    profileViews: '2,023'
  };

  const userAuthenticityData = [
    { name: 'Mass Followers', value: 26.3, color: '#3B82F6' },
    { name: 'Suspicious', value: 10.9, color: '#EC4899' },
    { name: 'Influencers', value: 13.2, color: '#93C5FD' },
    { name: 'Real', value: 49.7, color: '#10B981' }
  ];

  const followersReachabilityData = [
    { name: 'Reach 1', value: 45, color: '#3B82F6' },
    { name: 'Reach 2', value: 25, color: '#EC4899' },
    { name: 'Reach 3', value: 20, color: '#10B981' },
    { name: 'Reach 4', value: 10, color: '#F59E0B' }
  ];

  const contentBreakdownData = [
    { name: 'Jan', posts: 45 },
    { name: 'Feb', posts: 52 },
    { name: 'Mar', posts: 38 },
    { name: 'Apr', posts: 65 },
    { name: 'May', posts: 28 }
  ];

  const hashtagData = [
    { name: 'Mon', reach: 120 },
    { name: 'Tue', reach: 180 },
    { name: 'Wed', reach: 95 },
    { name: 'Thu', reach: 210 },
    { name: 'Fri', reach: 150 }
  ];

  const profileGrowthData = [
    { month: 'Jan', followers: 45000 },
    { month: 'Feb', followers: 48000 },
    { month: 'Mar', followers: 52000 },
    { month: 'Apr', followers: 55000 },
    { month: 'May', followers: 58900 }
  ];

  const significantFollowers = [
    { name: 'univ_indonesia', followers: '1.210.629', verified: true },
    { name: 'dr.ibrahimagung', followers: '698.441', verified: true },
    { name: 'dr.ibraheem_al_kaisy', followers: '285.200', verified: true },
    { name: 'dianwidayanti', followers: '273.696', verified: false },
    { name: 'fitria_irzan', followers: '243.583', verified: true },
    { name: 'dunia.ui', followers: '101.080', verified: true }
  ];

  const userPerformanceMetrics = [
    { label: 'AVG. LIKES', value: '3.326', progress: 65 },
    { label: 'AVG. COMMENTS', value: '1', progress: 20 },
    { label: 'AVG. VIEWS', value: '2.023', progress: 45 },
    { label: 'VTR', value: '35,8%', progress: 35 }
  ];

  const recentContent = [
    { id: 1, type: 'image', likes: 245, comments: 18, shares: 12 },
    { id: 2, type: 'carousel', likes: 389, comments: 32, shares: 24 },
    { id: 3, type: 'reel', likes: 567, comments: 45, shares: 38 },
    { id: 4, type: 'image', likes: 198, comments: 14, shares: 8 },
    { id: 5, type: 'story', likes: 123, comments: 7, shares: 5 },
    { id: 6, type: 'carousel', likes: 445, comments: 28, shares: 19 }
  ];

  const topHashtags = [
    { hashtag: '#design', reach: '45.2K', percentage: 85 },
    { hashtag: '#ui', reach: '32.1K', percentage: 70 },
    { hashtag: '#innovation', reach: '28.5K', percentage: 60 },
    { hashtag: '#creativity', reach: '19.8K', percentage: 45 },
    { hashtag: '#inspiration', reach: '15.2K', percentage: 35 }
  ];

  return (
    <div className="w-full space-y-6 p-6 bg-gray-900/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">@{username}</h2>
            <Badge className="bg-blue-600 text-white">Instagram</Badge>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          View Profile
        </Button>
      </div>

      {/* Key Metrics */}
      <KeyMetrics data={{
        followers: profileData.followers,
        following: profileData.following,
        engagement: profileData.engagement
      }} />

      {/* User Performance */}
      <UserPerformance metrics={userPerformanceMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Authenticity */}
        <UserAuthenticity data={userAuthenticityData} />

        {/* Significant Followers */}
        <SignificantFollowers followers={significantFollowers} />
      </div>

      {/* Followers Reachability */}
      <FollowersReachability data={followersReachabilityData} />

      {/* Profile Growth */}
      <ProfileGrowth data={profileGrowthData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Breakdown */}
        <ContentBreakdown data={contentBreakdownData} />

        {/* Hashtag Performance */}
        <HashtagPerformance data={hashtagData} />
      </div>

      {/* Recent Content */}
      <RecentContent content={recentContent} />

      {/* Top Hashtags */}
      <TopHashtags hashtags={topHashtags} />
    </div>
  );
};

export default InstagramAnalyticsDashboard;
