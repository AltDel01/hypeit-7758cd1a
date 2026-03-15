import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserCredits {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  bonusCredits: number;
  isLoading: boolean;
}

export function useUserCredits(): UserCredits {
  const { user } = useAuth();
  const [data, setData] = useState<{ used: number; limit: number; bonus: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('generations_this_month, monthly_generation_limit, bonus_credits')
        .eq('id', user.id)
        .maybeSingle();

      setData({
        used: (profile as any)?.generations_this_month || 0,
        limit: (profile as any)?.monthly_generation_limit || 25,
        bonus: (profile as any)?.bonus_credits || 0,
      });
      setIsLoading(false);
    };

    fetch();
  }, [user]);

  const used = data?.used || 0;
  const limit = data?.limit || 25;
  const bonus = data?.bonus || 0;
  const remaining = Math.max(0, limit - used + bonus);
  const percentage = limit > 0 ? Math.min((used / (limit + bonus)) * 100, 100) : 0;

  return { used, limit, remaining, percentage, bonusCredits: bonus, isLoading };
}
