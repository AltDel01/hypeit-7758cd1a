import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { RequestManagementSection } from '@/components/admin/RequestManagementSection';
import { TestRequestSection } from '@/components/admin/TestRequestSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Users, BarChart3 } from 'lucide-react';
import AdminEditorsSection from '@/components/admin/AdminEditorsSection';
import AdminStatsSection from '@/components/admin/AdminStatsSection';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading } = useAdminRole();

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
            <Tabs defaultValue="requests" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="requests" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Requests
                </TabsTrigger>
                <TabsTrigger value="editors" className="gap-2">
                  <Users className="h-4 w-4" />
                  Editors
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests">
                <TestRequestSection />
                <RequestManagementSection />
              </TabsContent>

              <TabsContent value="editors">
                <AdminEditorsSection />
              </TabsContent>

              <TabsContent value="stats">
                <AdminStatsSection />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Admin;
