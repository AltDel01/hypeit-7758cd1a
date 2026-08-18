import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { lookupCountry } from '@/utils/geo';
import {
  LANGUAGE_STORAGE_KEY,
  LanguageCode,
  isSupportedLanguage,
  languageForCountry,
} from '@/i18n';

/**
 * Resolves and persists the UI language.
 * Priority: saved profile preference > localStorage > detected country > browser locale > English.
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const resolvedRef = useRef(false);

  const current = (isSupportedLanguage(i18n.language) ? i18n.language : 'en') as LanguageCode;

  const applyLanguage = useCallback(
    (code: LanguageCode) => {
      i18n.changeLanguage(code);
      try { localStorage.setItem(LANGUAGE_STORAGE_KEY, code); } catch { /* ignore */ }
      if (typeof document !== 'undefined') document.documentElement.lang = code;
    },
    [i18n]
  );

  /** User-initiated change: apply locally and persist to the profile when signed in. */
  const setLanguage = useCallback(
    async (code: LanguageCode) => {
      applyLanguage(code);
      if (!user) return;
      try {
        await supabase.from('profiles').update({ preferred_language: code } as any).eq('id', user.id);
      } catch { /* ignore */ }
    },
    [applyLanguage, user]
  );

  // First-visit detection (only when the visitor never picked a language)
  useEffect(() => {
    if (resolvedRef.current) return;
    let stored: string | null = null;
    try { stored = localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch { /* ignore */ }
    if (isSupportedLanguage(stored)) { resolvedRef.current = true; return; }
    resolvedRef.current = true;
    (async () => {
      const geo = await lookupCountry();
      if (!geo) return;
      let latest: string | null = null;
      try { latest = localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch { /* ignore */ }
      if (isSupportedLanguage(latest)) return;
      applyLanguage(languageForCountry(geo.country_code));
    })();
  }, [applyLanguage]);

  // A signed-in user's saved preference wins across devices
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('preferred_language, country_code')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        const saved = (data as any).preferred_language;
        if (isSupportedLanguage(saved)) {
          applyLanguage(saved);
          return;
        }
        // No saved preference yet: seed from the profile country, then store it
        const fromCountry = languageForCountry((data as any).country_code);
        let stored: string | null = null;
        try { stored = localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch { /* ignore */ }
        const code = (isSupportedLanguage(stored) ? stored : fromCountry) as LanguageCode;
        applyLanguage(code);
        supabase.from('profiles').update({ preferred_language: code } as any).eq('id', user.id).then(() => {});
      });
    return () => { cancelled = true; };
  }, [user, applyLanguage]);

  return { language: current, setLanguage };
};
