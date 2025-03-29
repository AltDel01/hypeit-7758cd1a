
import React from 'react';
import DashboardHeader from './DashboardHeader';
import UsageMetrics from './UsageMetrics';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import { getUsageMetrics, getRecentActivity } from './data/dashboardData';

const Dashboard = () => {
  const usageMetrics = getUsageMetrics();
  const recentActivity = getRecentActivity();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardHeader />
      <UsageMetrics metrics={usageMetrics} />
      <QuickActions />
      <RecentActivity activities={recentActivity} />
    </div>
  );
};

export default Dashboard;
