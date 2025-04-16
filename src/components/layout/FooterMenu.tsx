
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Star, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const FooterMenu = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#8c52ff] border-t border-purple-700 md:hidden">
      <nav className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
          )}
        >
          <Camera size={20} />
          <span>Content</span>
        </Link>
        
        <Link 
          to="/brand-identity" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/brand-identity') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
          )}
        >
          <Star size={20} />
          <span>Brand Identity</span>
        </Link>
        
        <Link 
          to="/virality" 
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            isActive('/virality') ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
          )}
        >
          <TrendingUp size={20} />
          <span>Virality Strategy</span>
        </Link>
        
        <Link 
          to={user ? "/dashboard" : "/login"}
          className={cn(
            "flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300",
            (isActive('/dashboard') || isActive('/login')) ? 'text-white scale-110 animate-glow-pulse' : 'text-gray-200'
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
