import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';

interface AgeRangeData {
  name: string;
  value: number;
  percentage: number;
}

interface AgeRangeProps {
  data: AgeRangeData[];
}

const AgeRange: React.FC<AgeRangeProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm">
          <p className="font-semibold">{label}</p>
          <p>Age Range: {payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Age Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 60]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === '25-34' ? '#10B981' : '#86EFAC'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgeRange;