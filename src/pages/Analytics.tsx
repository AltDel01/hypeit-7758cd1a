
import React from 'react';
import Seo from '@/components/seo/Seo';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';

export default function Analytics() {
  return (
    <>
      <Seo
        title="Analytics, Creator and Content Insights, Viralin"
        description="Discover creators, track content performance, and analyze what makes posts go viral."
        path="/analytics"
      />
      <AnalyticsDashboard />
    </>
  );
}
