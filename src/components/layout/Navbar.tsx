import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, User, ChevronDown, Menu, X, Sparkles, CreditCard, HelpCircle, Globe, Gift } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserCredits } from '@/hooks/useUserCredits';
import ReferralDialog from '@/components/referral/ReferralDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const solutionKeys = [
  { key: 'shortForm', href: '/dashboard' },
  { key: 'promo', href: '/dashboard' },
  { key: 'explainer', href: '/dashboard' },
  { key: 'podcastVideo', href: '/dashboard' },
  { key: 'editVideo', href: '/dashboard' },
  { key: 'audioAd', href: '/dashboard' },
  { key: 'audioPodcast', href: '/dashboard' },
  { key: 'api', href: '/dashboard' },
  { key: 'meditation', href: '/dashboard' },
];

const MobileTopBar = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [mobileProfileName, setMobileProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setMobileProfileName(null); return; }
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.display_name) setMobileProfileName(data.display_name); });
  }, [user]);
  
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between w-full px-4 py-1 h-16">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/viralin-logo.png" 
            alt="Viralin Logo" 
            className="h-10 w-auto"
          />
        </Link>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-200 hover:text-white p-2"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-gray-800 z-50 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col p-4 space-y-1">
            {/* Solutions Expandable */}
            <button
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <span>{t('nav.solutions')}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isSolutionsOpen && "rotate-180")} />
            </button>
            {isSolutionsOpen && (
              <div className="ml-2 pl-3 border-l border-gray-700 space-y-0.5">
                {solutionKeys.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    className="block px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-white text-sm font-medium block">{t(`nav.solutionItems.${item.key}.label`)}</span>
                    <span className="text-gray-500 text-xs">{t(`nav.solutionItems.${item.key}.description`)}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link to="/features" className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('nav.features')}
            </Link>
            <Link to="/pricing" className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('nav.pricing')}
            </Link>
            <Link to="/enterprise" className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('nav.enterprise')}
            </Link>
            <div className="px-1 py-1">
              <LanguageSwitcher variant="inline" />
            </div>
            <div className="pt-2 border-t border-gray-800">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    {t('nav.dashboard')}
                  </Link>
                  <div className="border-t border-gray-700 my-2"></div>
                  <Link to="/settings" className="px-4 py-2 flex items-center gap-3 hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                      {(mobileProfileName || user.email)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{mobileProfileName || user.email?.split('@')[0] || 'User'}</p>
                      <p className="text-gray-400 text-xs">@{user.email?.split('@')[0] || 'user'}</p>
                    </div>
                  </Link>
                  <Link to="/pricing" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Sparkles size={18} />
                    {t('nav.upgradePlan')}
                  </Link>
                  <Link to="/language" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Globe size={18} />
                    {t('common.language')}
                  </Link>
                  <Link to="/credit-usage" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <CreditCard size={18} />
                    {t('nav.creditUsage')}
                  </Link>
                  <Link to="/help" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <HelpCircle size={18} />
                    {t('nav.help')}
                  </Link>
                  <button 
                    onClick={() => { signOut(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-gray-800">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white hover:opacity-90">
                      {t('common.tryForFree')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [referralOpen, setReferralOpen] = useState(false);
  const credits = useUserCredits();

  useEffect(() => {
    if (!user) {
      setProfileName(null);
      return;
    }
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setProfileName(data.display_name);
      });
  }, [user]);

  const NavLinks = () => (
    <>
      {/* Solutions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-white transition-colors">
            {t('nav.solutions')}
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 bg-gray-900/95 backdrop-blur-lg border-gray-800">
          {solutionKeys.map((item) => (
            <DropdownMenuItem key={item.key} asChild>
              <Link 
                to={item.href} 
                className="flex flex-col items-start text-left gap-1 px-4 py-3 cursor-pointer hover:bg-gray-800/50 w-full"
              >
                <span className="text-white font-bold text-sm">{t(`nav.solutionItems.${item.key}.label`)}</span>
                <span className="text-xs text-gray-400">{t(`nav.solutionItems.${item.key}.description`)}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <NavLink to="/features">{t('nav.features')}</NavLink>
      <NavLink to="/pricing">{t('nav.pricing')}</NavLink>
      <NavLink to="/enterprise">{t('nav.enterprise')}</NavLink>
    </>
  );

  const AuthButtons = () => (
    <>
      {user ? (
        <>
          <Link 
            to="/dashboard" 
            className="relative px-4 py-2 text-gray-300 hover:text-white rounded-lg transition-all duration-300 before:absolute before:inset-0 before:rounded-lg before:p-[1.5px] before:bg-gradient-to-r before:from-[#8c52ff] before:to-[#b616d6] before:transition-all before:duration-300 before:-z-10 before:content-[''] after:absolute after:inset-[1.5px] after:rounded-[6px] after:bg-black/80 after:-z-10 hover:before:shadow-[0_0_12px_rgba(140,82,255,0.6)] hover:before:brightness-125"
          >
            <span className="hidden md:inline relative z-10">{t('nav.dashboard')}</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-gray-800 flex items-center gap-1"
              >
                <span className="hidden md:inline">{t('nav.myAccount')}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-gray-900/95 backdrop-blur-lg border-gray-800">
              <Link to="/settings" className="block px-3 py-3 hover:bg-gray-800/50 rounded-md transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                    {(profileName || user.email)?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{profileName || user.email?.split('@')[0] || 'User'}</p>
                    <p className="text-gray-400 text-xs">@{user.email?.split('@')[0] || 'user'}</p>
                  </div>
                </div>
              </Link>
              <DropdownMenuSeparator className="bg-gray-700" />

              {/* Credits display */}
              {user && !credits.isLoading && (
                <div className="px-3 py-3">
                  <Link to="/credit-usage" className="block group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm font-medium">{t('nav.credits')}</span>
                      <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                        {t('nav.creditsLeft', { count: credits.remaining })} <span className="text-gray-500">›</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-[#b616d6] transition-all duration-500"
                        style={{ width: `${Math.max(2, 100 - credits.percentage)}%` }}
                      />
                    </div>
                    {credits.bonusCredits > 0 && (
                      <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        {t('nav.usingBonus')}
                      </p>
                    )}
                  </Link>
                </div>
              )}

              {/* Get free credits */}
              <button
                onClick={() => setReferralOpen(true)}
                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-800/50 rounded-md transition-colors cursor-pointer"
              >
                <Gift size={16} className="text-primary" />
                <span className="text-primary text-sm font-medium">{t('nav.getFreeCredits')}</span>
              </button>

              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild>
                <Link to="/pricing" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800/50">
                  <Sparkles size={16} className="text-gray-400" />
                  <span className="text-white">{t('nav.upgradePlan')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/language" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800/50">
                  <Globe size={16} className="text-gray-400" />
                  <span className="text-white">{t('common.language')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/credit-usage" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800/50">
                  <CreditCard size={16} className="text-gray-400" />
                  <span className="text-white">{t('nav.creditUsage')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild>
                <Link to="/help" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800/50">
                  <HelpCircle size={16} className="text-gray-400" />
                  <span className="text-white">{t('nav.help')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-800/50"
              >
                <LogOut size={16} className="text-gray-400" />
                <span className="text-white">{t('nav.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Button 
            asChild 
            variant="ghost" 
            className="text-white hover:bg-gray-800"
          >
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button 
            asChild
            className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white hover:opacity-90 border-0"
          >
            <Link to="/signup">{t('common.tryForFree')}</Link>
          </Button>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-black/80 backdrop-blur-lg text-white py-1 px-6 w-full border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {isMobile ? (
            <MobileTopBar />
          ) : (
            <>
              <div className={cn("flex items-center", isMobile ? "flex-1" : "")}>
                <Link to="/" className="flex items-center h-16">
                  <img 
                    src="/lovable-uploads/viralin-logo.png" 
                    alt="Viralin Logo" 
                    className="h-10 w-auto"
                  />
                </Link>
              </div>
              <div className="flex items-center justify-center flex-1 space-x-2">
                <NavLinks />
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <AuthButtons />
              </div>
            </>
          )}
        </div>
      </nav>
      
      <ReferralDialog open={referralOpen} onOpenChange={setReferralOpen} />
    </>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  return (
    <Link
      to={to}
      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
};

export default Navbar;
