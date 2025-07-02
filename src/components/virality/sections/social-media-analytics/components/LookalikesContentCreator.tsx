import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Creator {
  username: string;
  followers: string;
  imageUrl: string;
}

interface LookalikesContentCreatorProps {
  creators: Creator[];
}

const LookalikesContentCreator: React.FC<LookalikesContentCreatorProps> = ({ creators }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Lookalikes Content Creator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {creators.map((creator, index) => (
            <div key={index} className="space-y-3">
              <a 
                href={`https://www.instagram.com/${creator.username}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img 
                  src={creator.imageUrl}
                  alt={creator.username}
                  className="w-full h-full object-cover"
                />
              </a>
              <div className="text-center space-y-1">
                <p className="text-white font-medium">{creator.username}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">FOLLOWERS</p>
                  <p className="text-white font-semibold">{creator.followers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LookalikesContentCreator;