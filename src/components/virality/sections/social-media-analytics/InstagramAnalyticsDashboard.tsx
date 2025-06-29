
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
  PieChart
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

interface InstagramAnalyticsDashboardProps {
  username: string;
}

const InstagramAnalyticsDashboard: React.FC<InstagramAnalyticsDashboardProps> = ({ username }) => {
  // Mock data based on the reference image
  const profileData = {
    username: username,
    followers: '58.9K',
    following: '5,448',
    posts: '115',
    engagement: '3.5%',
    reach: '3,326',
    impressions: '35.8%',
    profileViews: '2,023'
  };

  const userAuthorityData = [
    { name: 'Men Followers', value: 35.5, color: '#3B82F6' },
    { name: 'Women Followers', value: 64.5, color: '#EC4899' },
    { name: 'Other', value: 0, color: '#10B981' }
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
    { name: 'john_photographer', followers: '125K', verified: true },
    { name: 'design_master', followers: '89K', verified: false },
    { name: 'creative_studio', followers: '67K', verified: true },
    { name: 'art_direction', followers: '45K', verified: false }
  ];

  const recentContent = [
    { id: 1, type: 'image', likes: 245, comments: 18, shares: 12 },
    { id: 2, type: 'carousel', likes: 389, comments: 32, shares: 24 },
    { id: 3, type: 'reel', likes: 567, comments: 45, shares: 38 },
    { id: 4, type: 'image', likes: 198, comments: 14, shares: 8 },
    { id: 5, type: 'story', likes: 123, comments: 7, shares: 5 },
    { id: 6, type: 'carousel', likes: 445, comments: 28, shares: 19 }
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
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Posts</p>
                <p className="text-2xl font-bold text-white">{profileData.posts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Engagement</p>
                <p className="text-2xl font-bold text-white">{profileData.engagement}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Performance */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            User Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Reach</span>
                <span className="text-white">{profileData.reach}</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Comments</span>
                <span className="text-white">1</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Impressions</span>
                <span className="text-white">{profileData.impressions}</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Profile Views</span>
                <span className="text-white">{profileData.profileViews}</span>
              </div>
              <Progress value={45} className="h-2" />
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
            <div className="space-y-4">
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
            <Eye className="h-5 w-5 mr-2" />
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

      {/* Profile Growth */}
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
        {/* Content Breakdown */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Content Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentBreakdownData}>
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
                  <Bar dataKey="posts" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hashtag Performance */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Hashtag Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hashtagData}>
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
                  <Bar dataKey="reach" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentContent.map((content) => (
              <div key={content.id} className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{content.type.charAt(0).toUpperCase()}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Likes</span>
                    <span className="text-white">{content.likes}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Comments</span>
                    <span className="text-white">{content.comments}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Shares</span>
                    <span className="text-white">{content.shares}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Hashtags */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { hashtag: '#design', reach: '45.2K', percentage: 85 },
              { hashtag: '#ui', reach: '32.1K', percentage: 70 },
              { hashtag: '#innovation', reach: '28.5K', percentage: 60 },
              { hashtag: '#creativity', reach: '19.8K', percentage: 45 },
              { hashtag: '#inspiration', reach: '15.2K', percentage: 35 }
            ].map((item, index) => (
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
    </div>
  );
};

export default InstagramAnalyticsDashboard;
