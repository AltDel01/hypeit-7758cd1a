import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import id from './locales/id';
import vi from './locales/vi';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const LANGUAGE_STORAGE_KEY = 'preferred_language';

export const isSupportedLanguage = (value: unknown): value is LanguageCode =>
  typeof value === 'string' && SUPPORTED_LANGUAGES.some((l) => l.code === value);

/** Map a country code to the language we default to for that market. */
export const languageForCountry = (countryCode?: string | null): LanguageCode => {
  switch ((countryCode || '').toUpperCase()) {
    case 'ID':
      return 'id';
    case 'VN':
      return 'vi';
    default:
      return 'en';
  }
};

const browserLanguage = (): LanguageCode => {
  const langs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const raw of langs) {
    const base = (raw || '').toLowerCase().split('-')[0];
    if (base === 'id' || base === 'in') return 'id';
    if (base === 'vi') return 'vi';
    if (base === 'en') return 'en';
  }
  return 'en';
};

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
const initialLanguage: LanguageCode = isSupportedLanguage(stored) ? stored : browserLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
    vi: { translation: vi },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

export const hasStoredLanguage = () => isSupportedLanguage(stored);

export default i18n;
