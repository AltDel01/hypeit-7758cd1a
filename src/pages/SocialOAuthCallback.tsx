import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function SocialOAuthCallback() {
  const { provider = '' } = useParams();
  const [message, setMessage] = useState('Finishing connection...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notify = (type: 'socialOAuthComplete' | 'socialOAuthFailed', extra: Record<string, unknown> = {}) => {
      window.opener?.postMessage({ type, provider, ...extra }, window.location.origin);
      window.setTimeout(() => window.close(), 300);
    };
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      setMessage('Connection was cancelled.');
      notify('socialOAuthFailed', { reason: 'Connection was cancelled' });
      return;
    }
    supabase.functions
      .invoke('social-oauth-callback', { body: { code, state } })
      .then(({ data, error }) => {
        if (error || !data?.ok) throw new Error(data?.error || 'Could not finish the connection');
        setMessage('Connected! You can close this window.');
        notify('socialOAuthComplete', { result: data });
      })
      .catch((e) => {
        setMessage('Could not finish the connection.');
        notify('socialOAuthFailed', { reason: e instanceof Error ? e.message : undefined });
      });
  }, [provider]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <p>{message}</p>
    </div>
  );
}
