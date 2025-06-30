
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Eye,
  UserPlus,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Cell, 
  Pie,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from 'recharts';

interface EndeavorIndoDashboardProps {
  username: string;
}

const EndeavorIndoDashboard: React.FC<EndeavorIndoDashboardProps> = ({ username }) => {
  // Mock data based on the reference image
  const profileData = {
    username: username,
    followers: '13,032',
    following: '676',
    posts: '0.5%',
    engagement: '3.2%',
    avgLikes: '62',
    comments: '0',
    views: '5,696',
    impressions: '43.7%'
  };

  const userAuthorityData = [
    { name: 'Male Followers', value: 35, color: '#3B82F6' },
    { name: 'Female Followers', value: 45, color: '#EC4899' },
    { name: 'Non-binary', value: 15, color: '#10B981' },
    { name: 'Unknown', value: 5, color: '#F59E0B' }
  ];

  const followersReachabilityData = [
    { name: 'High Reach', value: 45, color: '#10B981' },
    { name: 'Medium Reach', value: 35, color: '#3B82F6' },
    { name: 'Low Reach', value: 15, color: '#EC4899' },
    { name: 'No Reach', value: 5, color: '#F59E0B' }
  ];

  const profileGrowthData = [
    { month: 'Jan', followers: 8500 },
    { month: 'Feb', followers: 9200 },
    { month: 'Mar', followers: 10800 },
    { month: 'Apr', followers: 11900 },
    { month: 'May', followers: 12500 },
    { month: 'Jun', followers: 13032 }
  ];

  const audienceBreakdownData = [
    { name: 'Mon', value: 15 },
    { name: 'Tue', value: 22 },
    { name: 'Wed', value: 18 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 20 }
  ];

  const topHashtagsData = [
    { name: 'Mon', value: 8 },
    { name: 'Tue', value: 12 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 10 },
    { name: 'Fri', value: 18 }
  ];

  const ageGenderData = [
    { name: 'Mon', male: 25, female: 35 },
    { name: 'Tue', male: 30, female: 40 },
    { name: 'Wed', male: 20, female: 25 },
    { name: 'Thu', male: 35, female: 30 },
    { name: 'Fri', male: 28, female: 32 }
  ];

  const genderDistributionData = [
    { name: 'Male', value: 45, color: '#3B82F6' },
    { name: 'Female', value: 55, color: '#EC4899' }
  ];

  const significantFollowers = [
    { name: 'entrepreneur', followers: '45K', verified: true },
    { name: 'tech_id', followers: '32K', verified: false },
    { name: 'startup_indo', followers: '28K', verified: true },
    { name: 'business_id', followers: '19K', verified: false },
    { name: 'innovation_hub', followers: '15K', verified: true },
    { name: 'venture_capital', followers: '12K', verified: false }
  ];

  const topHashtags = [
    { hashtag: '#entrepreneur', reach: '2.8K', percentage: 85 },
    { hashtag: '#startup', reach: '2.1K', percentage: 70 },
    { hashtag: '#business', reach: '1.9K', percentage: 60 },
    { hashtag: '#innovation', reach: '1.5K', percentage: 45 },
    { hashtag: '#technology', reach: '1.2K', percentage: 35 }
  ];

  const topMentions = [
    { mention: '@startup_id', reach: '1.8K', percentage: 75 },
    { mention: '@tech_entrepreneur', reach: '1.4K', percentage: 60 },
    { mention: '@business_indo', reach: '1.1K', percentage: 45 },
    { mention: '@innovation_hub', reach: '0.9K', percentage: 35 },
    { mention: '@venture_capital', reach: '0.7K', percentage: 25 }
  ];

  const recentContent = [
    { id: 1, type: 'image', likes: 45, comments: 8, shares: 3, title: 'Startup Summit' },
    { id: 2, type: 'carousel', likes: 67, comments: 12, shares: 5, title: 'Innovation Talk' },
    { id: 3, type: 'reel', likes: 89, comments: 15, shares: 8, title: 'Tech Trends' },
    { id: 4, type: 'image', likes: 34, comments: 6, shares: 2, title: 'Business Tips' }
  ];

  const sponsoredContent = [
    { id: 1, title: 'Startup Accelerator', engagement: '2.3K', reach: '15K' },
    { id: 2, title: 'Business Conference', engagement: '1.8K', reach: '12K' },
    { id: 3, title: 'Tech Innovation', engagement: '1.5K', reach: '9K' },
    { id: 4, title: 'Investment Forum', engagement: '1.2K', reach: '8K' }
  ];

  const lookalikeSimilarAccounts = [
    { name: 'startup_mentor', similarity: '89%', followers: '25K' },
    { name: 'business_coach', similarity: '87%', followers: '32K' },
    { name: 'entrepreneur_id', similarity: '85%', followers: '18K' },
    { name: 'tech_innovator', similarity: '83%', followers: '22K' },
    { name: 'startup_guru', similarity: '81%', followers: '28K' }
  ];

  return (
    <div className="w-full space-y-6 p-6 bg-gray-900/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Followers</p>
                <p className="text-2xl font-bold text-white">{profileData.followers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Following</p>
                <p className="text-2xl font-bold text-white">{profileData.following}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Engagement Rate</p>
                <p className="text-2xl font-bold text-white">{profileData.posts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Avg Views</p>
                <p className="text-2xl font-bold text-white">{profileData.views}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follower Health and Engagement */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Follower Health and Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Likes</span>
                <span className="text-white">{profileData.avgLikes}</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Comments</span>
                <span className="text-white">{profileData.comments}</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Views</span>
                <span className="text-white">{profileData.views}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Impressions</span>
                <span className="text-white">{profileData.impressions}</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Authority */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              User Authority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={userAuthorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {userAuthorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {userAuthorityData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-400">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Significant Followers */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Significant Followers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {significantFollowers.map((follower, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {follower.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">@{follower.name}</p>
                      <p className="text-sm text-gray-400">{follower.followers} followers</p>
                    </div>
                  </div>
                  {follower.verified && (
                    <Badge className="bg-blue-600 text-white text-xs">Verified</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Followers Reachability */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Followers Reachability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={followersReachabilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {followersReachabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profile Growth - Last 6 Months */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Profile Growth - Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profileGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Breakdown */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Audience Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={audienceBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Tags */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top 5 Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topHashtagsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Age Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageGenderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="male" fill="#3B82F6" />
                  <Bar dataKey="female" fill="#EC4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gender */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Gender</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={genderDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {genderDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Hashtags */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topHashtags.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-medium">{item.hashtag}</span>
                  <span className="text-white">{item.reach}</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Mentions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMentions.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 font-medium">{item.mention}</span>
                  <span className="text-white">{item.reach}</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Content */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentContent.map((content) => (
              <div key={content.id} className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{content.type.charAt(0).toUpperCase()}</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">{content.title}</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Likes: {content.likes}</span>
                    <span className="text-gray-400">Comments: {content.comments}</span>
                  </div>
                  <div className="text-xs text-gray-400">Shares: {content.shares}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sponsored Content */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Sponsored Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sponsoredContent.map((content) => (
              <div key={content.id} className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <div className="aspect-video bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">{content.title}</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Engagement: {content.engagement}</span>
                    <span className="text-gray-400">Reach: {content.reach}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lookalike Similar Accounts */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lookalike Similar Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {lookalikeSimilarAccounts.map((account, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-white font-medium text-sm">@{account.name}</h4>
                  <p className="text-xs text-gray-400">{account.followers} followers</p>
                  <p className="text-xs text-green-400">{account.similarity} similar</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndeavorIndoDashboard;
