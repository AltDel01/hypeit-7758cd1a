
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-10',
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-lg font-medium"
        >
          <div className="h-10 w-10 bg-gradient-to-br from-brand-blue to-brand-teal rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="text-xl font-semibold">BrandGen</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <Button 
            asChild 
            variant="outline" 
            className="border-brand-blue text-brand-blue hover:bg-brand-blue/10"
          >
            <Link to="/login">Login</Link>
          </Button>
          <Button 
            asChild
            className="bg-gradient-to-r from-brand-blue to-brand-teal hover:shadow-lg transition-all duration-300 text-white"
          >
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X size={24} className="animate-fade-in" />
          ) : (
            <Menu size={24} className="animate-fade-in" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 top-[72px] z-40 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
          "bg-white/95 backdrop-blur-lg"
        )}
      >
        <div className="flex flex-col space-y-4 p-6 text-center">
          <MobileNavLink to="/" onClick={toggleMobileMenu}>Home</MobileNavLink>
          <MobileNavLink to="/features" onClick={toggleMobileMenu}>Features</MobileNavLink>
          <MobileNavLink to="/pricing" onClick={toggleMobileMenu}>Pricing</MobileNavLink>
          <div className="pt-4 flex flex-col space-y-3">
            <Button 
              asChild 
              variant="outline" 
              className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue/10"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-brand-blue to-brand-teal hover:shadow-lg transition-all duration-300 text-white"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "relative px-1 py-2 font-medium transition-colors",
        isActive 
          ? "text-brand-blue" 
          : "text-brand-slate-700 hover:text-brand-blue"
      )}
    >
      {children}
      <span
        className={cn(
          "absolute bottom-0 left-0 h-0.5 bg-brand-blue transition-all duration-300",
          isActive ? "w-full" : "w-0"
        )}
      />
    </Link>
  );
};

const MobileNavLink = ({ 
  to, 
  children, 
  onClick 
}: { 
  to: string; 
  children: React.ReactNode;
  onClick: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-lg font-medium rounded-md transition-all",
        isActive
          ? "bg-brand-slate-100 text-brand-blue"
          : "text-brand-slate-700 hover:bg-brand-slate-50 hover:text-brand-blue"
      )}
    >
      {children}
    </Link>
  );
};

export default Navbar;
