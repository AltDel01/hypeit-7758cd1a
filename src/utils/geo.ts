import { supabase } from '@/integrations/supabase/client';

export interface GeoInfo {
  country_code: string;
  country_name: string;
}

/** Look up the visitor's country from their IP. Returns null on any failure. */
export const lookupCountry = async (): Promise<GeoInfo | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = await res.json();
    const code = typeof data?.country_code === 'string' ? data.country_code.toUpperCase() : '';
    if (!/^[A-Z]{2}$/.test(code)) return null;
    const name = typeof data?.country_name === 'string' && data.country_name.trim()
      ? data.country_name.trim().slice(0, 100)
      : code;
    return { country_code: code, country_name: name };
  } catch {
    return null;
  }
};

/**
 * Store the country on the user's own profile when it isn't set yet.
 * Silent and non-blocking: any failure is ignored.
 */
export const captureUserCountry = async (userId: string, attempt = 0) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('country_code')
      .eq('id', userId)
      .maybeSingle();

    if (error) return;
    if (!profile) {
      // Profile row may still be getting created right after signup
      if (attempt < 2) setTimeout(() => { captureUserCountry(userId, attempt + 1); }, 2000);
      return;
    }
    if ((profile as any).country_code) return;


    const geo = await lookupCountry();
    if (!geo) return;

    await supabase
      .from('profiles')
      .update({ country_code: geo.country_code, country_name: geo.country_name } as any)
      .eq('id', userId);
  } catch {
    /* ignore */
  }
};
