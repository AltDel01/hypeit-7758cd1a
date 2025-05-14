import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FooterMenu from './FooterMenu';

const MobileTopBar = () => {
  const { user } = useAuth();
  return (
    <div className="flex md:hidden items-center justify-between w-full px-4 py-1 h-16">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/04ce31a6-f289-4db5-8b56-7c67d26d6113.png" 
          alt="HYPEIT Logo" 
          className="h-10 w-auto"
        />
      </Link>

      <Link
        to={user ? '/dashboard' : '/login'}
        className="text-gray-200 hover:text-white"
      >
        <User size={22} />
      </Link>
    </div>
  );
};

const Navbar = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const NavLinks = () => (
    <>
      <NavLink to="/">Generate Content</NavLink>
      <NavLink to="/virality">Virality Strategy</NavLink>
      <NavLink to="/brand-identity">Brand Identity</NavLink>
      <NavLink to="/analytics">Analytics</NavLink>
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
            className="bg-white text-black hover:bg-gray-200"
          >
            <Link to="/signup">Sign up</Link>
          </Button>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-black text-white py-1 px-6 w-full border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {isMobile ? (
            <MobileTopBar />
          ) : (
            <>
              <div className={cn("flex items-center", isMobile ? "flex-1" : "")}>
                <Link to="/" className="flex items-center h-20">
                  <img 
                    src="/lovable-uploads/04ce31a6-f289-4db5-8b56-7c67d26d6113.png" 
                    alt="HYPEIT Logo" 
                    className="h-12 w-auto"
                  />
                </Link>
              </div>
              <div className="flex items-center justify-center flex-1 space-x-8">
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
