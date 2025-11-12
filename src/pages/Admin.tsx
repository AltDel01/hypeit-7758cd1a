
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { RequestManagementSection } from '@/components/admin/RequestManagementSection';
import { TestRequestSection } from '@/components/admin/TestRequestSection';

const Admin = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <TestRequestSection />
            <RequestManagementSection />
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Admin;
