
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-black text-white py-3 px-6 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/d753a6a4-7d27-4f13-b2f0-9738bc8626c4.png" 
            alt="If Viral Logo" 
            className="h-8 w-8"
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center justify-center flex-1 space-x-8">
          <NavLink to="/">Generate Content</NavLink>
          <NavLink to="/brand-identity">Brand Identity</NavLink>
          <NavLink to="/virality">Virality Strategy</NavLink>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
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
        </div>
      </div>
    </nav>
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
