import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import AuroraBackground from '@/components/effects/AuroraBackground';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RequestList } from '@/components/admin/RequestList';
import { claimGenerationRequest } from '@/services/generationRequestService';
import type { GenerationRequest } from '@/services/generationRequestService';

const EditorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('assigned');

  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('generation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading editor requests:', error);
      return;
    }
    setRequests((data || []) as GenerationRequest[]);
  }, [user]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 15000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const handleClaimAndOpen = useCallback(async (requestId: string) => {
    const success = await claimGenerationRequest(requestId);
    if (success) {
      toast.success('Request claimed!');
      await loadRequests();
      navigate(`/editor/requests/${requestId}`);
    } else {
      toast.error('Failed to claim request');
    }
  }, [loadRequests, navigate]);

  const handleOpen = useCallback((requestId: string) => {
    navigate(`/editor/requests/${requestId}`);
  }, [navigate]);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'assigned') return r.assigned_to === user?.id;
    if (activeTab === 'in-progress') return r.assigned_to === user?.id && r.status === 'in-progress';
    if (activeTab === 'completed') return r.assigned_to === user?.id && r.status === 'completed';
    return true;
  });

  return (
    <AuroraBackground>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">Editor Dashboard</h1>
                <p className="text-muted-foreground">View and work on your assigned tasks</p>
              </div>
              <Button onClick={() => { loadRequests(); toast.info('Refreshed'); }} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab}>
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all">All Assigned</TabsTrigger>
                  <TabsTrigger value="assigned">My Tasks</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <RequestList
                  requests={filteredRequests}
                  onOpenRequest={handleOpen}
                  onClaimAndOpenRequest={handleClaimAndOpen}
                  currentUserId={user?.id}
                />
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default EditorDashboard;
