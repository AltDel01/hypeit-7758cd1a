
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, ThumbsUp } from 'lucide-react';
import KeyMetrics from './components/KeyMetrics';
import UserPerformance from './components/UserPerformance';
import UserAuthenticity from './components/UserAuthenticity';
import SignificantFollowers from './components/SignificantFollowers';
import FollowersReachability from './components/FollowersReachability';
import ProfileGrowth from './components/ProfileGrowth';
import TopCountries from './components/TopCountries';
import TopCities from './components/TopCities';
import AgeRange from './components/AgeRange';
import Gender from './components/Gender';
import TopHashtagsList from './components/TopHashtagsList';
import TopMentionsList from './components/TopMentionsList';
import TopInterestsList from './components/TopInterestsList';
import TopContents from './components/TopContents';
import RecentContent from './components/RecentContent';


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
    { name: '-500', value: 29.7, color: '#3B82F6' },
    { name: '500-1000', value: 26.9, color: '#EC4899' },
    { name: '1000-1500', value: 17.2, color: '#93C5FD' },
    { name: '1500-', value: 26.3, color: '#10B981' }
  ];

  const topCountriesData = [
    { name: 'ID', value: 95 },
    { name: 'AU', value: 2 },
    { name: 'JP', value: 1 },
    { name: 'KR', value: 1 },
    { name: 'MY', value: 1 },
    { name: 'GB', value: 1 },
    { name: 'NL', value: 1 }
  ];

  const topCitiesData = [
    { name: 'Jakarta', value: 23 },
    { name: 'Depok', value: 21 },
    { name: 'Bandung', value: 5 },
    { name: 'Yogyakarta', value: 3 },
    { name: 'Bogor', value: 2 }
  ];

  const ageRangeData = [
    { name: '13-17', value: 4, percentage: 4.0 },
    { name: '18-24', value: 28, percentage: 28.5 },
    { name: '25-34', value: 57, percentage: 57.259 },
    { name: '35-44', value: 8, percentage: 8.2 },
    { name: '45-64', value: 2, percentage: 2.1 }
  ];

  const genderData = [
    { name: 'Female', value: 44.8, color: '#93C5FD' },
    { name: 'Male', value: 55.2, color: '#3B82F6' }
  ];

  const topHashtagsList = [
    '#universitasindonesia',
    '#direktoratinovasidanrisetberda',
    '#ui_unggul_impactful_untuk_indo',
    '#dirbtui',
    '#distpui',
    '#inovasi',
    '#stpui',
    '#inovasiindonesia',
    '#risetberdampaktinggi',
    '#ui'
  ];

  const topMentionsList = [
    '@univ_indonesia',
    '@sandhy_yusuf',
    '@herlens_id',
    '@distp_ui',
    '@innovation_ui',
    '@chairul_hudaya',
    '@teguh_iman_santoso',
    '@brin_indonesia',
    '@ferie_budiansyah',
    '@hamdi_muluk'
  ];

  const topInterestsList = [
    { name: 'Travel, Tourism & Aviation', percentage: 25.9 },
    { name: 'Camera & Photography', percentage: 24.6 },
    { name: 'Electronics & Computers', percentage: 24.4 },
    { name: 'Friends, Family & Relationships', percentage: 22.8 }
  ];

  const topContentsMetrics = [
    { label: 'AVG. VIEWS', value: '0', icon: Eye },
    { label: 'ENGAGEMENT', value: '1,468', icon: Users },
    { label: 'TOTAL VIEWS', value: '0', icon: Eye },
    { label: 'MEDIA LIKES', value: '1,168', icon: ThumbsUp }
  ];

  const profileGrowthData = [
    { month: '2024-12-01', followers: 4300, averageLikes: 400 },
    { month: '2025-01-01', followers: 4500, averageLikes: 400 },
    { month: '2025-02-01', followers: 4800, averageLikes: 300 },
    { month: '2025-03-01', followers: 5000, averageLikes: 350 },
    { month: '2025-04-01', followers: 5200, averageLikes: 400 },
    { month: '2025-05-01', followers: 5500, averageLikes: 1700 }
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
    { 
      id: 1, 
      imageUrl: '/lovable-uploads/1adb1d29-4142-452f-b42c-e4d462103943.png',
      link: 'https://www.instagram.com/p/DCOjvLkztky/',
      publishDate: '2024-11-12',
      likes: 837, 
      comments: 66 
    },
    { 
      id: 2, 
      imageUrl: '/lovable-uploads/30ea8caa-a226-4029-9933-1a8e5b289a5e.png',
      link: 'https://www.instagram.com/p/DF_6CQhSP7_/',
      publishDate: '2025-02-13',
      likes: 96, 
      comments: 1 
    },
    { 
      id: 3, 
      imageUrl: '/lovable-uploads/0a4cdcc3-887d-47da-a571-eb47c159dff0.png',
      link: 'https://www.instagram.com/p/DC6AR_hhOA6/',
      publishDate: '2024-11-28',
      likes: 88, 
      comments: 1 
    },
    { 
      id: 4, 
      imageUrl: '/lovable-uploads/f12f3f1a-c1be-43f8-b726-f104d80f1f00.png',
      link: 'https://www.instagram.com/p/DDErRUovQhp/',
      publishDate: '2024-12-03',
      likes: 50, 
      comments: 1 
    }
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
        {/* Top 5 Countries */}
        <TopCountries data={topCountriesData} />

        {/* Top 5 City */}
        <TopCities data={topCitiesData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Range */}
        <AgeRange data={ageRangeData} />

        {/* Gender */}
        <Gender data={genderData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hashtags */}
        <TopHashtagsList hashtags={topHashtagsList} />

        {/* Top Mentions */}
        <TopMentionsList mentions={topMentionsList} />

        {/* Top Interests */}
        <TopInterestsList interests={topInterestsList} />
      </div>

      {/* Top Contents */}
      <TopContents metrics={topContentsMetrics} />

      {/* Recent Content */}
      <RecentContent content={recentContent} />
    </div>
  );
};

export default InstagramAnalyticsDashboard;
