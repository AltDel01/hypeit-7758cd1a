import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentItem {
  id: number;
  type: string;
  likes: number;
  comments: number;
  shares: number;
}

interface RecentContentProps {
  content: ContentItem[];
}

const RecentContent: React.FC<RecentContentProps> = ({ content }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {content.map((item) => (
            <div key={item.id} className="bg-gray-700/30 rounded-lg p-4 space-y-2">
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{item.type.charAt(0).toUpperCase()}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Likes</span>
                  <span className="text-white">{item.likes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Comments</span>
                  <span className="text-white">{item.comments}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Shares</span>
                  <span className="text-white">{item.shares}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentContent;