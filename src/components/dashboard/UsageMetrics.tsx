
import React from 'react';
import { cn } from '@/lib/utils';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';

export interface UsageMetric {
  label: string;
  current: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}

interface UsageMetricsProps {
  metrics: UsageMetric[];
}

const UsageMetrics = ({ metrics }: UsageMetricsProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-lg md:text-xl font-semibold text-white">Usage This Month</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <GlassMorphismCard key={idx} className="p-4 bg-gray-900/50 border-gray-700">
            <div className="flex items-start">
              <div className={cn(
                "flex items-center justify-center rounded-md p-2 mr-3",
                `bg-gradient-to-br ${metric.color} text-white`
              )}>
                {metric.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{metric.label}</h3>
                <div className="mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">
                      {metric.current} of {metric.total} used
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round((metric.current / metric.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        `bg-gradient-to-r ${metric.color}`
                      )}
                      style={{ width: `${(metric.current / metric.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </GlassMorphismCard>
        ))}
      </div>
    </section>
  );
};

export default UsageMetrics;
