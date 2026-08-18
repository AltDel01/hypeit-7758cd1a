import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/i18n';
import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'inline';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'navbar' }) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const active = SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t('common.language')}
          className={
            variant === 'navbar'
              ? 'flex items-center gap-1.5 px-2.5 py-2 text-gray-300 hover:text-white transition-colors rounded-md'
              : 'flex items-center gap-2 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors'
          }
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm">{active.flag}</span>
          <span className={variant === 'navbar' ? 'hidden lg:inline text-sm' : 'text-sm'}>
            {active.code.toUpperCase()}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-900/95 backdrop-blur-lg border-gray-800 z-50">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as LanguageCode)}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800/50"
          >
            <span>{lang.flag}</span>
            <span className="text-white text-sm flex-1">{lang.nativeName}</span>
            {language === lang.code && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
