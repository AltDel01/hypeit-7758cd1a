import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopHashtagsListProps {
  hashtags: string[];
}

const TopHashtagsList: React.FC<TopHashtagsListProps> = ({ hashtags }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Top Hashtags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-300 leading-relaxed">
          {hashtags.map((hashtag, index) => (
            <span key={index}>
              <span className="text-blue-400">{hashtag}</span>
              {index < hashtags.length - 1 && (
                <span className="text-gray-400 mx-2">/</span>
              )}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopHashtagsList;