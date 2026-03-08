
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { RequestManagementSection } from '@/components/admin/RequestManagementSection';
import { TestRequestSection } from '@/components/admin/TestRequestSection';
import { Button } from '@/components/ui/button';
import { Users, BarChart3 } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading } = useAdminRole();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Admin Navigation */}
            <div className="flex gap-2 mb-6">
              <Button variant="outline" onClick={() => navigate('/admin/editors')} className="gap-2">
                <Users className="h-4 w-4" />
                Manage Editors
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/stats')} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance Stats
              </Button>
            </div>
            <TestRequestSection />
            <RequestManagementSection />
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Admin;
