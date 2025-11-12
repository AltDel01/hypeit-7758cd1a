import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, Heart } from 'lucide-react';

interface MetricData {
  followers: string;
  following: string;
  engagement: string;
}

interface KeyMetricsProps {
  data: MetricData;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Followers</p>
              <p className="text-2xl font-bold text-white">{data.followers}</p>
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
              <p className="text-2xl font-bold text-white">{data.following}</p>
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
              <p className="text-2xl font-bold text-white">{data.engagement}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetrics;