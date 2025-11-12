import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, ThumbsUp } from 'lucide-react';

interface ContentMetric {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
}

interface TopContentsProps {
  metrics: ContentMetric[];
}

const TopContents: React.FC<TopContentsProps> = ({ metrics }) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Top Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4 text-center space-y-2">
              <div className="flex justify-center">
                <metric.icon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopContents;