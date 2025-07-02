import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopMentionsListProps {
  mentions: string[];
}

const TopMentionsList: React.FC<TopMentionsListProps> = ({ mentions }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Top Mentions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-300 leading-relaxed">
          {mentions.map((mention, index) => (
            <span key={index}>
              <span className="text-blue-400">{mention}</span>
              {index < mentions.length - 1 && (
                <span className="text-gray-400 mx-2">/</span>
              )}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopMentionsList;