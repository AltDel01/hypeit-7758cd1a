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

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    requests,
    isLoading,
    refresh: loadRequests,
  };
};
