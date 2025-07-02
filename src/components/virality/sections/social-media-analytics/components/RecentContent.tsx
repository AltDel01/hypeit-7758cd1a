import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentItem {
  id: number;
  imageUrl: string;
  link: string;
  publishDate: string;
  likes: number;
  comments: number;
}

interface RecentContentProps {
  content: ContentItem[];
}

const RecentContent: React.FC<RecentContentProps> = ({ content }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {content.map((item) => (
            <div key={item.id} className="space-y-3">
              <a 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img 
                  src={item.imageUrl}
                  alt={`Content ${item.id}`}
                  className="w-full h-full object-cover"
                />
              </a>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">Publish at {item.publishDate}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Likes</span>
                  <span className="text-white">{item.likes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Comment</span>
                  <span className="text-white">{item.comments}</span>
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