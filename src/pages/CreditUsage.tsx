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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Credit Usage</h1>
            <p className="text-gray-400 text-sm">Track your credit consumption and history</p>
          </div>
        </div>

        {/* Usage Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Credits Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{usedCredits}</div>
              <p className="text-xs text-gray-500">out of {totalCredits} this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Credits Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalCredits - usedCredits}</div>
              <p className="text-xs text-gray-500">available credits</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white capitalize">{profile?.subscription_tier || 'Free'}</div>
              <p className="text-xs text-gray-500">{totalCredits} credits/month</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Credits consumed</span>
                <span className="text-white font-medium">{usedCredits} / {totalCredits}</span>
              </div>
              <Progress value={usagePercentage} className="h-3 bg-gray-800" />
              <p className="text-xs text-gray-500">
                {usagePercentage >= 80 
                  ? "You're running low on credits. Consider upgrading your plan."
                  : `${Math.round(100 - usagePercentage)}% of your monthly credits remaining`
                }
              </p>
            </div>
            {usagePercentage >= 80 && (
              <Link to="/pricing" className="block mt-4">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Usage History */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Usage History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No usage history yet</p>
                <p className="text-gray-500 text-sm mt-1">Start generating content to see your usage here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usageHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{item.action}</p>
                        <p className="text-gray-500 text-xs">{item.platform} • {formatDate(item.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-medium">-{item.credits}</span>
                      <p className="text-gray-500 text-xs">credit</p>
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
