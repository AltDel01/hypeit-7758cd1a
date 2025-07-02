import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Interest {
  name: string;
  percentage: number;
}

interface TopInterestsListProps {
  interests: Interest[];
}

const TopInterestsList: React.FC<TopInterestsListProps> = ({ interests }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Top Interests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interests.map((interest, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">{interest.name}</span>
                <span className="text-white font-semibold">{interest.percentage}%</span>
              </div>
              <Progress value={interest.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopInterestsList;