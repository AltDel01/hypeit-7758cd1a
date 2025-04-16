
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const FooterMenu = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 md:hidden">
      <nav className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-400'
          )}
        >
          <Camera size={20} />
          <span>Content</span>
        </Link>
        
        <Link 
          to="/brand-identity" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/brand-identity') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-400'
          )}
        >
          {/* Using a standard span with ® symbol instead of a non-existent icon */}
          <span className="flex items-center justify-center w-5 h-5 text-lg font-bold">®</span>
          <span className="flex items-center gap-0.5">Brand Identity<sup>®</sup></span>
        </Link>
        
        <Link 
          to="/virality" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/virality') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-400'
          )}
        >
          <TrendingUp size={20} />
          <span>Virality Strategy</span>
        </Link>
        
        <Link 
          to={user ? "/dashboard" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            (isActive('/dashboard') || isActive('/login')) ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-400'
          )}
        >
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default FooterMenu;
