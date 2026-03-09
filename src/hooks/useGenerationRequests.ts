import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  GenerationRequest, 
  fetchUserGenerationRequests 
} from '@/services/generationRequestService';

export const useGenerationRequests = (userId: string | undefined) => {
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    if (!userId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchUserGenerationRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Real-time subscription + polling fallback
  useEffect(() => {
    if (!userId) return;

    let pollInterval = 3000;
    let lastUpdatedAt: string | null = null;
    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Primary: realtime subscription
    const channel = supabase
      .channel(`generation_requests_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generation_requests',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);
          pollInterval = 3000; // Reset on successful realtime
          
          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [payload.new as GenerationRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((req) =>
                req.id === payload.new.id ? (payload.new as GenerationRequest) : req
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) =>
              prev.filter((req) => req.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Fallback: polling with backoff (catches missed realtime events)
    const poll = async () => {
      if (!isActive) return;
      try {
        const data = await fetchUserGenerationRequests();
        if (!isActive) return;

        // Check if data actually changed by comparing first item's updated_at
        const latestUpdate = data.length > 0 ? data[0].updated_at : null;
        if (latestUpdate && latestUpdate !== lastUpdatedAt) {
          lastUpdatedAt = latestUpdate;
          setRequests(data);
          pollInterval = 3000; // Reset on change
        } else {
          // No change: slow down polling (max 30s)
          pollInterval = Math.min(pollInterval * 1.5, 30000);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
      if (isActive) {
        timeoutId = setTimeout(poll, pollInterval);
      }
    };

    // Start polling after initial delay
    timeoutId = setTimeout(poll, pollInterval);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    requests,
    isLoading,
    refresh: loadRequests,
  };
};
