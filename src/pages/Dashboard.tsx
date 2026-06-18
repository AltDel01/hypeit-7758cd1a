import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X, History, Home, Layers, Megaphone, Brain, Mic2, Camera, Workflow, CalendarRange } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import GenerationHistory from '@/components/dashboard/GenerationHistory';
import RequestDetailView from '@/components/dashboard/RequestDetailView';
import SequenceGeneration from '@/components/tools/SequenceGeneration';
import AdCopyGenerator from '@/components/tools/AdCopyGenerator';
import ViralPredictor from '@/components/tools/ViralPredictor';
import LipSyncStudio from '@/components/tools/LipSyncStudio';
import CinemaStudio from '@/components/tools/CinemaStudio';
import WorkflowStudio from '@/components/tools/WorkflowStudio';
import CreativeWorkflow from '@/components/tools/CreativeWorkflow';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerationRequests } from '@/hooks/useGenerationRequests';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GenerationRequest } from '@/services/generationRequestService';
import { supabase } from '@/integrations/supabase/client';

export type FeedbackMap = Record<string, { rating: number; feedback: string }>;

type ToolId = 'calendar' | 'sequence' | 'adcopy' | 'predictor' | 'lipsync' | 'cinema' | 'workflow';

const TOOLS: { id: ToolId; label: string; icon: typeof Layers }[] = [
  { id: 'calendar', label: 'Calendar', icon: CalendarRange },
  { id: 'sequence', label: 'Sequence', icon: Layers },
  { id: 'adcopy', label: 'Ad Copy', icon: Megaphone },
  { id: 'predictor', label: 'Predictor', icon: Brain },
  { id: 'lipsync', label: 'Lip Sync', icon: Mic2 },
  { id: 'cinema', label: 'Cinema', icon: Camera },
  { id: 'workflow', label: 'Workflow', icon: Workflow },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequest | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolId>('calendar');
  const [feedbackMap, setFeedbackMap] = useState<FeedbackMap>({});

  const { requests, isLoading } = useGenerationRequests(user?.id);

  const fetchFeedbackMap = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('review_feedback')
      .select('request_id, rating, feedback')
      .eq('user_id', user.id);
    if (data) {
      const map: FeedbackMap = {};
      (data as any[]).forEach((d) => {
        map[d.request_id] = { rating: d.rating, feedback: d.feedback || '' };
      });
      setFeedbackMap(map);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedbackMap();
  }, [fetchFeedbackMap, requests]);

  React.useEffect(() => {
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('postLoginRedirect', currentUrl);
      sessionStorage.setItem('authRedirectPending', '1');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const requestId = searchParams.get('request');
    if (requestId && requests.length > 0 && !selectedRequest) {
      const match = requests.find((r) => r.id === requestId);
      if (match) {
        setSelectedRequest(match);
        setHistoryOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, requests, selectedRequest, setSearchParams]);

  useEffect(() => {
    if (!selectedRequest) return;
    const updated = requests.find((r) => r.id === selectedRequest.id);
    if (updated && updated !== selectedRequest) {
      setSelectedRequest(updated);
    }
  }, [requests, selectedRequest]);

  const handleSelectRequest = (request: GenerationRequest) => {
    setSelectedRequest(request);
    if (isMobile) setHistoryOpen(false);
  };

  if (!user) return null;

  const HistoryPanel = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">History</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {requests.length} generation{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(false)} className="h-8 w-8">
          <X size={18} />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <GenerationHistory
          requests={requests}
          selectedId={selectedRequest?.id || null}
          onSelect={handleSelectRequest}
          isLoading={isLoading}
          feedbackMap={feedbackMap}
        />
      </div>
    </div>
  );

  return (
    <AuroraBackground>
      <div className="flex min-h-screen w-full">
        {/* Canva-style permanent rail */}
        <nav className="w-20 flex-shrink-0 border-r border-border bg-card/40 backdrop-blur-sm flex flex-col items-center py-4 gap-2">
          <Link
            to="/"
            className="mb-1 flex flex-col items-center gap-1 w-16 py-2 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
            title="Home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* History toggle (collapsable) */}
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className={cn(
              'flex flex-col items-center gap-1 w-16 py-2 rounded-xl transition-all',
              historyOpen ? 'bg-[#8C52FF]/20 text-[#8C52FF]' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
            title="History"
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">History</span>
          </button>

          <div className="w-10 h-px bg-border my-1" />

          {/* Permanent tool features */}
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id);
                setSelectedRequest(null);
              }}
              className={cn(
                'flex flex-col items-center gap-1 w-16 py-2 rounded-xl transition-all',
                activeTool === t.id && !selectedRequest
                  ? 'bg-[#8C52FF]/20 text-[#8C52FF]'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
              title={t.label}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Collapsible history panel */}
        {historyOpen && (
          <aside className="w-72 flex-shrink-0 border-r border-border bg-card/30 backdrop-blur-sm overflow-hidden">
            {HistoryPanel}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
            {selectedRequest ? (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tools
                </Button>
                <RequestDetailView request={selectedRequest} onFeedbackSubmitted={fetchFeedbackMap} />
              </div>
            ) : (
              <div className="animate-fade-in">
                {activeTool === 'calendar' && <CreativeWorkflow />}
                {activeTool === 'sequence' && <SequenceGeneration />}
                {activeTool === 'adcopy' && <AdCopyGenerator />}
                {activeTool === 'predictor' && <ViralPredictor />}
                {activeTool === 'lipsync' && <LipSyncStudio />}
                {activeTool === 'cinema' && <CinemaStudio />}
                {activeTool === 'workflow' && <WorkflowStudio />}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Dashboard;
