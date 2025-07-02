import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HashtagItem {
  hashtag: string;
  reach: string;
  percentage: number;
}

interface TopHashtagsProps {
  hashtags: HashtagItem[];
}

const TopHashtags: React.FC<TopHashtagsProps> = ({ hashtags }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Top Hashtags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hashtags.map((item, index) => (
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
  );
};

export default TopHashtags;