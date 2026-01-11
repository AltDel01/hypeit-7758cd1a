import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FooterMenu from './FooterMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MobileTopBar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
        <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-gray-800 z-50 animate-fade-in">
          <div className="flex flex-col p-4 space-y-2">
            <Link to="/" className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              Solutions
            </Link>
            <Link to="/features" className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>
            <Link to="/pricing" className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link to="/enterprise" className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
              Enterprise
            </Link>
            <div className="pt-2 border-t border-gray-800">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <User size={18} />
                    Profile
                  </Link>
                  <button 
                    onClick={() => { signOut(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-gray-800">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white hover:opacity-90">
                      Try for Free
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
  const isMobile = useIsMobile();

  const solutionsItems = [
    { label: 'AI Video Editor', href: '/dashboard', description: 'Edit videos with AI prompts' },
    { label: 'Social Content Generator', href: '/', description: 'Generate social media content' },
    { label: 'Brand Identity', href: '/brand-identity', description: 'Create your brand identity' },
    { label: 'Virality Strategy', href: '/virality', description: 'Optimize for virality' },
  ];

  const NavLinks = () => (
    <>
      {/* Solutions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-white transition-colors">
            Solutions
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-gray-900/95 backdrop-blur-lg border-gray-800">
          {solutionsItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link 
                to={item.href} 
                className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer hover:bg-gray-800/50"
              >
                <span className="text-white font-medium">{item.label}</span>
                <span className="text-xs text-gray-400">{item.description}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <NavLink to="/features">Features</NavLink>
      <NavLink to="/pricing">Pricing</NavLink>
      <NavLink to="/enterprise">Enterprise</NavLink>
    </>
  );

  const AuthButtons = () => (
    <>
      {user ? (
        <>
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white">
            <User size={18} />
            <span className="hidden md:inline">Profile</span>
          </Link>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-gray-800"
            onClick={() => signOut()}
          >
            <LogOut size={18} className="mr-2" />
            <span className="hidden md:inline">Log out</span>
          </Button>
        </>
      ) : (
        <>
          <Button 
            asChild 
            variant="ghost" 
            className="text-white hover:bg-gray-800"
          >
            <Link to="/login">Log in</Link>
          </Button>
          <Button 
            asChild
            className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] text-white hover:opacity-90 border-0"
          >
            <Link to="/signup">Try for Free</Link>
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
                <AuthButtons />
              </div>
            </>
          )}
        </div>
      </nav>
      
      <FooterMenu />
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
