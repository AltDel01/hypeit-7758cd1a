import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, History as HistoryIcon } from 'lucide-react';
import ProjectsShowcase from './ProjectsShowcase';
import { GenerationRequest } from '@/services/generationRequestService';

interface SimplifiedDashboardProps {
  onRequestCreated?: () => void;
  latestRequest?: GenerationRequest | null;
}

/**
 * Dashboard landing view: history + projects only.
 * The generation prompt UI lives exclusively on the homepage (/).
 */
const SimplifiedDashboard = ({ latestRequest }: SimplifiedDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/40 backdrop-blur-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Your Generations</h1>
          <p className="text-sm text-muted-foreground">
            Browse, replay, and manage everything you have created. Pick any item from the History panel to see the details.
          </p>
        </div>
        <Link to="/">
          <Button
            className="text-white font-semibold"
            style={{ backgroundImage: 'linear-gradient(to right, #8c52ff, #b616d6)' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create new
          </Button>
        </Link>
      </div>

      {!latestRequest && (
        <div className="rounded-xl border border-dashed border-border bg-card/20 p-10 text-center">
          <HistoryIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            You have not generated anything yet. Head back to the homepage to create your first video.
          </p>
        </div>
      )}

      <ProjectsShowcase />
    </div>
  );
};

export default SimplifiedDashboard;
