import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Menu, X, History } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import SimplifiedDashboard from '@/components/dashboard/SimplifiedDashboard';
import GenerationHistory from '@/components/dashboard/GenerationHistory';
import RequestDetailView from '@/components/dashboard/RequestDetailView';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerationRequests } from '@/hooks/useGenerationRequests';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { GenerationRequest } from '@/services/generationRequestService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequest | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { requests, isLoading, refresh } = useGenerationRequests(user?.id);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/signup');
    }
  }, [user, navigate]);

  const handleSelectRequest = (request: GenerationRequest) => {
    setSelectedRequest(request);
    if (isMobile) {
      setHistoryOpen(false);
    }
  };

  const handleRequestCreated = () => {
    refresh();
    setSelectedRequest(null);
  };

  if (!user) return null;

  const HistoryPanel = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">History</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {requests.length} generation{requests.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <GenerationHistory
          requests={requests}
          selectedId={selectedRequest?.id || null}
          onSelect={handleSelectRequest}
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  return (
    <AuroraBackground>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar - Collapsible */}
        {!isMobile && (
          <aside className={`border-r border-border bg-card/30 backdrop-blur-sm transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-14'}`}>
            {/* Header with toggle */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              {sidebarOpen ? (
                <>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                  </Link>
                  <Link to="/" className="flex items-center flex-1">
                    <img 
                      src="/lovable-uploads/viralin-logo.png" 
                      alt="Viralin Logo" 
                      className="h-7 w-auto"
                    />
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSidebarOpen(false)}
                    className="h-8 w-8"
                  >
                    <X size={18} />
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(true)}
                  className="h-8 w-8 mx-auto"
                >
                  <Menu size={20} />
                </Button>
              )}
            </div>
            {sidebarOpen && HistoryPanel}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile Header */}
          {isMobile && (
            <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-3">
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <Link to="/" className="flex items-center">
                  <img 
                    src="/lovable-uploads/viralin-logo.png" 
                    alt="Viralin Logo" 
                    className="h-7 w-auto"
                  />
                </Link>
              </div>
              
              {/* History Sheet Trigger */}
              <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <History className="h-5 w-5" />
                    {requests.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                        {requests.length > 9 ? '9+' : requests.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  {HistoryPanel}
                </SheetContent>
              </Sheet>
            </header>
          )}

          {/* Content Area */}
          <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
            {/* Show selected request detail or prompt interface */}
            {selectedRequest ? (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedRequest(null)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Create
                </Button>
                <RequestDetailView request={selectedRequest} />
              </div>
            ) : (
              <SimplifiedDashboard onRequestCreated={handleRequestCreated} />
            )}
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
};

export default Dashboard;
