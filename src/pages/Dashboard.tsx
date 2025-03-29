
import React from 'react';
import DashboardComponent from '@/components/dashboard/Dashboard';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';

const Dashboard = () => {
  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <div className="flex-1">
          <DashboardComponent />
        </div>
      </div>
    </AuroraBackground>
  );
};

export default Dashboard;
