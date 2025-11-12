import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { 
  ResponsiveContainer,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart,
  Line
} from 'recharts';

interface GrowthData {
  month: string;
  followers: number;
  averageLikes: number;
}

interface ProfileGrowthProps {
  data: GrowthData[];
}

const ProfileGrowth: React.FC<ProfileGrowthProps> = ({ data }) => {
  return (
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
            <LineChart data={data}>
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
              <Line 
                type="monotone" 
                dataKey="followers" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#3B82F6' }}
                name="Followers Growth"
              />
              <Line 
                type="monotone" 
                dataKey="averageLikes" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#10B981' }}
                name="Average Likes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileGrowth;