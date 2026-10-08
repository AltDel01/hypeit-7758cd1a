import React, { useCallback, useEffect, useState } from 'react';
import { Instagram, Facebook, Loader2, Link2, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import TikTokIcon from '@/components/tools/TikTokIcon';

export type SocialPlatform = 'tiktok' | 'instagram' | 'facebook';
export type SocialConnection = { platform: SocialPlatform; account_name: string | null; avatar_url: string | null };

const META: Record<SocialPlatform, { label: string; provider: 'tiktok' | 'meta'; icon: React.ComponentType<{ className?: string }> }> = {
  tiktok: { label: 'TikTok', provider: 'tiktok', icon: TikTokIcon },
  instagram: { label: 'Instagram', provider: 'meta', icon: Instagram },
  facebook: { label: 'Facebook', provider: 'meta', icon: Facebook },
};

function waitForPopup(popup: Window, provider: string) {
  return new Promise<{ connected?: string[]; instagramMissing?: boolean }>((resolve, reject) => {
    const cleanup = () => { window.removeEventListener('message', onMsg); window.clearInterval(poll); };
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== popup || e.data?.provider !== provider) return;
      if (e.data?.type !== 'socialOAuthComplete' && e.data?.type !== 'socialOAuthFailed') return;
      cleanup();
      if (e.data.type === 'socialOAuthComplete') resolve(e.data.result ?? {});
      else reject(new Error(e.data.reason || 'Connection failed'));
    };
    window.addEventListener('message', onMsg);
    const poll = window.setInterval(() => {
      if (popup.closed) { cleanup(); reject(new Error('Window closed before connecting')); }
    }, 500);
  });
}

export function useSocialConnections() {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [configured, setConfigured] = useState({ tiktok: false, meta: false });
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    const { data } = await supabase.functions.invoke('social-connections', { body: { action: 'list' } });
    if (data?.connections) setConnections(data.connections);
    if (data?.configured) setConfigured(data.configured);
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const isConnected = (p: SocialPlatform) => connections.some((c) => c.platform === p);
  return { connections, configured, loading, refresh, isConnected };
}

interface Props { state: ReturnType<typeof useSocialConnections> }

const ConnectedAccounts = ({ state }: Props) => {
  const { connections, configured, loading, refresh } = state;
  const [busy, setBusy] = useState<string | null>(null);

  const connect = async (p: SocialPlatform) => {
    const provider = META[p].provider;
    const popup = window.open('', 'viralin-social', 'width=600,height=740');
    if (!popup) { toast.error('Popup blocked. Allow popups and try again.'); return; }
    setBusy(p);
    try {
      const { data, error } = await supabase.functions.invoke('social-oauth-start', {
        body: { provider, origin: window.location.origin },
      });
      if (error || !data?.authorizationUrl) {
        throw new Error(data?.error === 'not_configured' || !data ? `${META[p].label} connection is not available yet` : 'Could not start connection');
      }
      const done = waitForPopup(popup, provider);
      popup.location.href = data.authorizationUrl;
      const result = await done;
      await refresh();
      if (provider === 'meta') {
        toast.success(result.instagramMissing
          ? 'Facebook connected. No Instagram Business account is linked to that Page.'
          : 'Instagram and Facebook connected.');
      } else toast.success('TikTok connected.');
    } catch (e) {
      popup.close();
      toast.error(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (p: SocialPlatform) => {
    setBusy(p);
    await supabase.functions.invoke('social-connections', { body: { action: 'disconnect', platform: p } });
    await refresh();
    setBusy(null);
    toast.success(`${META[p].label} disconnected.`);
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Link2 className="h-4 w-4 text-primary" /> Connected Accounts
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(Object.keys(META) as SocialPlatform[]).map((p) => {
          const Icon = META[p].icon;
          const conn = connections.find((c) => c.platform === p);
          const available = configured[META[p].provider];
          return (
            <div key={p} className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3">
              {conn?.avatar_url
                ? <img src={conn.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                : <Icon className="h-6 w-6 text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">{META[p].label}</div>
                <div className="truncate text-sm text-foreground">
                  {loading ? '...' : conn ? conn.account_name : available ? 'Not connected' : 'Coming soon'}
                </div>
              </div>
              {conn ? (
                <Button size="sm" variant="ghost" disabled={busy === p} onClick={() => disconnect(p)} title="Disconnect">
                  {busy === p ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                </Button>
              ) : (
                <Button size="sm" disabled={!available || busy === p || loading} onClick={() => connect(p)}>
                  {busy === p ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectedAccounts;
