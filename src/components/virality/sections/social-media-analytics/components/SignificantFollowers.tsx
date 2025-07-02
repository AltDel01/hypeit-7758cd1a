import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Follower {
  name: string;
  followers: string;
  verified: boolean;
}

interface SignificantFollowersProps {
  followers: Follower[];
}

const SignificantFollowers: React.FC<SignificantFollowersProps> = ({ followers }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Significant Followers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {followers.map((follower, index) => (
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
  );
};

export default SignificantFollowers;