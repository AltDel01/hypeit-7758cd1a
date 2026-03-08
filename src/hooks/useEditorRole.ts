import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to check if the current user has editor role.
 */
export const useEditorRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [isEditor, setIsEditor] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    const checkEditorRole = async () => {
      if (!user) {
        setIsEditor(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'editor'
        });

        if (error) {
          console.error('Error checking editor role:', error);
          setIsEditor(false);
        } else {
          setIsEditor(data || false);
        }
      } catch (error) {
        console.error('Error checking editor role:', error);
        setIsEditor(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEditorRole();
  }, [user, authLoading]);

  return { isEditor, isLoading };
};
