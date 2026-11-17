import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const UPGRADE_REQUIRED_MESSAGE =
  'Generating is available on paid plans right now. Please upgrade to continue.';

let cache: { userId: string; allowed: boolean; at: number } | null = null;
const CACHE_MS = 30_000;

/** True when the signed-in user may generate (paid plan, settled payment or staff). */
export async function canGenerate(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return false;
  if (cache && cache.userId === userId && Date.now() - cache.at < CACHE_MS) return cache.allowed;
  const { data: allowed, error } = await (supabase.rpc as any)('can_i_generate');
  if (error) {
    console.error('[generationAccess] check failed', error);
    // Let the server decide; every generation service enforces the same rule.
    return true;
  }
  cache = { userId, allowed: allowed === true, at: Date.now() };
  return cache.allowed;
}

export function showUpgradeRequired() {
  toast.error(UPGRADE_REQUIRED_MESSAGE, {
    id: 'upgrade-required',
    action: { label: 'Upgrade', onClick: () => { window.location.href = '/pricing'; } },
  });
}

/** Checks access and shows the upgrade notice when blocked. Returns true to proceed. */
export async function ensureCanGenerate(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    toast.error('Please sign in to continue.', { id: 'sign-in-required' });
    return false;
  }
  if (await canGenerate()) return true;
  showUpgradeRequired();
  return false;
}

/** Authorization header carrying the user's session (falls back to the public key). */
export async function userAuthHeader(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return `Bearer ${data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
}
