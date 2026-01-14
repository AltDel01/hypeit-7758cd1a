import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UsageHistoryItem {
  id: string;
  action: string;
  credits: number;
  date: string;
  platform: string;
}

const CreditUsage = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: generatedImages } = useQuery({
    queryKey: ['generated-images', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const usedCredits = profile?.generations_this_month || 0;
  const totalCredits = profile?.monthly_generation_limit || 25;
  const usagePercentage = (usedCredits / totalCredits) * 100;

  // Transform generated images into usage history
  const usageHistory: UsageHistoryItem[] = (generatedImages || []).map((img) => ({
    id: img.id,
    action: 'Image Generation',
    credits: 1,
    date: img.created_at || '',
    platform: img.platform,
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Credit Usage</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Track your credit consumption and history</p>
          </div>
        </div>

        {/* Usage Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-gray-900/50 border-gray-800 col-span-2 sm:col-span-1">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1.5 sm:gap-2">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                Credits Used
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-white">{usedCredits}</div>
              <p className="text-[10px] sm:text-xs text-gray-500">out of {totalCredits} this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                <span className="hidden sm:inline">Credits </span>Remaining
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-white">{totalCredits - usedCredits}</div>
              <p className="text-[10px] sm:text-xs text-gray-500">available</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-white capitalize">{profile?.subscription_tier || 'Free'}</div>
              <p className="text-[10px] sm:text-xs text-gray-500">{totalCredits}/month</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6 sm:mb-8">
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
            <CardTitle className="text-base sm:text-lg font-medium text-white">Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Credits consumed</span>
                <span className="text-white font-medium">{usedCredits} / {totalCredits}</span>
              </div>
              <Progress value={usagePercentage} className="h-2.5 sm:h-3 bg-gray-800" />
              <p className="text-[10px] sm:text-xs text-gray-500">
                {usagePercentage >= 80 
                  ? "You're running low on credits. Consider upgrading."
                  : `${Math.round(100 - usagePercentage)}% of your monthly credits remaining`
                }
              </p>
            </div>
            {usagePercentage >= 80 && (
              <Link to="/pricing" className="block mt-4">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 sm:h-10">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Usage History */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
            <CardTitle className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              Usage History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 pt-0">
            {usageHistory.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-400 text-sm">No usage history yet</p>
                <p className="text-gray-500 text-xs mt-1">Start generating content to see your usage here</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {usageHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-xs sm:text-sm truncate">{item.action}</p>
                        <p className="text-gray-500 text-[10px] sm:text-xs truncate">{item.platform} • {formatDate(item.date)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-red-400 font-medium text-sm">-{item.credits}</span>
                      <p className="text-gray-500 text-[10px] sm:text-xs">credit</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreditUsage;
